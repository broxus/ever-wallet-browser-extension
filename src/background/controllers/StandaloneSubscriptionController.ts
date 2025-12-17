import { Mutex } from '@broxus/await-semaphore'
import type { ContractUpdatesSubscription } from 'everscale-inpage-provider'
import type * as nt from '@broxus/ever-wallet-wasm'
import log from 'loglevel'

import { NekotonRpcError, RpcErrorCode, type SendMessageCallback } from '@app/shared'
import { type ProviderEvent, type RawProviderEventData } from '@app/models'

import { type IContractHandler } from '../utils/ContractSubscription'
import { GenericContractSubscription } from '../utils/GenericContractSubscription'
import { type BaseConfig, BaseController, type BaseState } from './BaseController'
import { type ConnectionController } from './ConnectionController'

interface SubscriptionControllerConfig extends BaseConfig {
    clock: nt.ClockWithOffset;
    connectionController: ConnectionController;
    notifyTab?: <T extends ProviderEvent>(
        payload: { method: T; params: RawProviderEventData<T> },
    ) => void;
}

type SubscriptionControllerState = BaseState

function makeDefaultState(): SubscriptionControllerState {
    return {}
}

function makeDefaultSubscriptionState(): ContractUpdatesSubscription {
    return {
        state: false,
        transactions: false,
    }
}

// eslint-disable-next-line @stylistic/max-len
export class StandaloneSubscriptionController extends BaseController<SubscriptionControllerConfig, SubscriptionControllerState> {

    private readonly _subscriptions: Map<string, GenericContractSubscription> = new Map()

    private readonly _subscriptionsMutex: Mutex = new Mutex()

    private readonly _sendMessageRequests: Map<string, Map<string, SendMessageCallback>> = new Map()

    private readonly _tabSubscriptions: Map<string, ContractUpdatesSubscription> = new Map()

    private readonly _walletSubscriptions: Map<string, ContractUpdatesSubscription> = new Map()

    constructor(config: SubscriptionControllerConfig, state?: SubscriptionControllerState) {
        super(config, state || makeDefaultState())
        this.initialize()
    }

    public async subscribeToContract(
        address: string,
        params: Partial<ContractUpdatesSubscription>,
    ): Promise<ContractUpdatesSubscription> {
        return this._subscriptionsMutex.use(async () => {
            if (Object.keys(params).length === 0) {
                return this._tabSubscriptions.get(address) || makeDefaultSubscriptionState()
            }

            const tabSubscriptionState = this._tabSubscriptions.get(address) || makeDefaultSubscriptionState()

            this._updateSubscriptionState(tabSubscriptionState, params)

            if (this._allFlagsDisabled(tabSubscriptionState)) {
                this._tabSubscriptions.delete(address)
                await this._tryUnsubscribe(address)
                return tabSubscriptionState
            }

            this._tabSubscriptions.set(address, tabSubscriptionState)

            const isNewSubscription = !this._subscriptions.get(address)
            if (isNewSubscription) {
                const subscription = await this._createSubscription(address, this._tabSubscriptions)
                await subscription.start()
            }

            return tabSubscriptionState
        })
    }

    public async unsubscribeFromContract(address: string) {
        await this.subscribeToContract(address, {
            state: false,
            transactions: false,
        })
    }

    public async unsubscribeFromAllContracts() {
        for (const address of this._tabSubscriptions.keys()) {
            await this.unsubscribeFromContract(address)
        }
    }

    public getTabSubscriptions() {
        return Object.fromEntries(this._tabSubscriptions)
    }

    public async stopSubscriptions() {
        await this.unsubscribeFromAllContracts()
        await this._clearSendMessageRequests()
    }

    public async sendMessageLocally(
        address: string,
        signedMessage: nt.SignedMessage,
        params?: nt.ExecutorParams,
    ): Promise<nt.Transaction> {
        await this._walletSubscribeToContract(address, { state: true })

        const subscription = this._subscriptions.get(address)

        if (subscription == null) {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                'Failed to subscribe to contract',
            )
        }

        return subscription.use(async contract => {
            try {
                return await contract.sendMessageLocally(signedMessage, params)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, e.toString())
            }
        })
    }

    public async sendMessage(
        address: string,
        signedMessage: nt.SignedMessage,
    ): Promise<() => Promise<nt.Transaction | undefined>> {
        let messageRequests = this._sendMessageRequests.get(address)
        if (messageRequests == null) {
            messageRequests = new Map()
            this._sendMessageRequests.set(address, messageRequests)
        }

        let callback: SendMessageCallback
        const promise = new Promise<nt.Transaction | undefined>((resolve, reject) => {
            callback = {
                resolve: (tx) => resolve(tx),
                reject: (e) => reject(e),
            }
        })

        const id = signedMessage.hash
        messageRequests.set(id, callback!)

        try {
            await this._walletSubscribeToContract(address, { state: true })
            const subscription = this._subscriptions.get(address)

            if (subscription == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    'Failed to subscribe to contract',
                )
            }

            await subscription.prepareReliablePolling()
            await subscription.use(async contract => {
                try {
                    await contract.sendMessage(signedMessage)
                    subscription.skipRefreshTimer(contract.pollingMethod)
                }
                catch (e: any) {
                    throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, e.toString())
                }
            })
        }
        catch (e: any) {
            await this._rejectMessageRequest(address, id, e)
            throw e
        }

        return () => promise
    }

    private async _walletSubscribeToContract(
        address: string,
        params: Partial<ContractUpdatesSubscription>,
    ): Promise<ContractUpdatesSubscription> {
        return this._subscriptionsMutex.use(async () => {
            if (Object.keys(params).length === 0) {
                return this._walletSubscriptions.get(address) || makeDefaultSubscriptionState()
            }

            const walletSubscriptionState = this._walletSubscriptions.get(address) || makeDefaultSubscriptionState()

            this._updateSubscriptionState(walletSubscriptionState, params)

            this._walletSubscriptions.set(address, walletSubscriptionState)

            const isNewSubscription = !this._subscriptions.get(address)
            if (isNewSubscription) {
                const subscription = await this._createSubscription(address, this._walletSubscriptions)
                await subscription.start()
            }

            return walletSubscriptionState
        })
    }

    private async _createSubscription(address: string, subscriptionsUpdates: Map<string, ContractUpdatesSubscription>) {
        class ContractHandler implements IContractHandler<nt.Transaction> {

            private readonly _address: string

            private readonly _controller: StandaloneSubscriptionController

            private _enabled: boolean = false

            private _isTab: boolean = true

            constructor(address: string, controller: StandaloneSubscriptionController) {
                this._address = address
                this._controller = controller
            }

            public enableNotifications() {
                this._enabled = true
            }

            onMessageExpired(pendingTransaction: nt.PendingTransaction) {
                if (!this._enabled) return

                this._controller
                    ._resolveMessageRequest(
                        this._address,
                        pendingTransaction.messageHash,
                        undefined,
                    )
                    .catch(log.error)
            }

            onMessageSent(pendingTransaction: nt.PendingTransaction, transaction: nt.Transaction) {
                if (!this._enabled) return

                this._controller
                    ._resolveMessageRequest(
                        this._address,
                        pendingTransaction.messageHash,
                        transaction,
                    )
                    .catch(log.error)
            }

            onStateChanged(newState: nt.ContractState) {
                if (!this._enabled) return

                this._controller._notifyStateChanged(this._address, newState, subscriptionsUpdates)
            }

            onTransactionsFound(transactions: Array<nt.Transaction>, info: nt.TransactionsBatchInfo) {
                if (!this._enabled) return

                this._controller._notifyTransactionsFound(this._address, transactions, info, subscriptionsUpdates)
            }

        }

        const handler = new ContractHandler(address, this)

        const subscription = await GenericContractSubscription.subscribe(
            this.config.clock,
            this.config.connectionController,
            address,
            handler,
        )

        subscription.setPollingInterval(this.config.connectionController.selectedConnectionPollings
            .tokenWalletRefreshInterval)
        handler.enableNotifications()
        this._subscriptions.set(address, subscription)

        return subscription
    }

    private async _tryUnsubscribe(address: string) {
        const tabSubscription = this._tabSubscriptions.get(address)
        const walletSubscriptions = this._walletSubscriptions.get(address)
        const sendMessageRequests = this._sendMessageRequests.get(address)


        if (sendMessageRequests?.size) return

        if (walletSubscriptions) {
            this._walletSubscriptions.delete(address)
        }

        if (!tabSubscription) {
            const subscription = this._subscriptions.get(address)
            this._subscriptions.delete(address)
            await subscription?.stop()
        }
    }

    private async _clearSendMessageRequests() {
        const rejectionError = new NekotonRpcError(
            RpcErrorCode.RESOURCE_UNAVAILABLE,
            'The request was rejected; please try again',
        )

        const addresses = Array.from(this._sendMessageRequests.keys())
        for (const address of addresses) {
            const ids = Array.from(this._sendMessageRequests.get(address)?.keys() || [])
            for (const id of ids) {
                await this._rejectMessageRequest(address, id, rejectionError)
            }
        }
        this._sendMessageRequests.clear()
    }

    private async _rejectMessageRequest(address: string, id: string, error: Error) {
        this._deleteMessageRequestAndGetCallback(address, id).reject(error)
        await this._subscriptionsMutex.use(async () => this._tryUnsubscribe(address))
    }

    private async _resolveMessageRequest(address: string, id: string, transaction?: nt.Transaction) {
        this._deleteMessageRequestAndGetCallback(address, id).resolve(transaction)
        await this._subscriptionsMutex.use(async () => this._tryUnsubscribe(address))
    }

    private _deleteMessageRequestAndGetCallback(address: string, id: string): SendMessageCallback {
        const callbacks = this._sendMessageRequests.get(address)?.get(id)
        if (!callbacks) {
            throw new Error(`SendMessage request with id "${id}" not found`)
        }

        this._deleteMessageRequest(address, id)
        return callbacks
    }

    private _deleteMessageRequest(address: string, id: string) {
        const accountMessageRequests = this._sendMessageRequests.get(address)
        if (!accountMessageRequests) {
            return
        }
        accountMessageRequests.delete(id)
        if (accountMessageRequests.size === 0) {
            this._sendMessageRequests.delete(address)
        }
    }

    private _notifyStateChanged(
        address: string,
        state: nt.ContractState,
        subscriptionsUpdates: Map<string, ContractUpdatesSubscription>,
    ) {
        const notifyState = subscriptionsUpdates.get(address)?.state
        if (notifyState) {
            this.config.notifyTab?.({
                method: 'contractStateChanged',
                params: {
                    address,
                    state,
                },
            })
        }
    }

    private _notifyTransactionsFound(
        address: string,
        transactions: nt.Transaction[],
        info: nt.TransactionsBatchInfo,
        subscriptionsUpdates: Map<string, ContractUpdatesSubscription>,
    ) {
        log.trace('Transactions found', transactions, info, subscriptionsUpdates)

        const notifyTransactions = subscriptionsUpdates.get(address)?.transactions
        if (notifyTransactions) {
            this.config.notifyTab?.({
                method: 'transactionsFound',
                params: {
                    address,
                    transactions,
                    info,
                },
            })
        }
    }

    private _allFlagsDisabled(subscription: ContractUpdatesSubscription) {
        return Object.values(subscription).every(v => v === false)
    }

    private _updateSubscriptionState = (
        current: ContractUpdatesSubscription,
        updates: Partial<ContractUpdatesSubscription>,
    ) => {
        for (const key of Object.keys(current) as Array<keyof ContractUpdatesSubscription>) {
            const value = updates[key]
            if (typeof value === 'boolean') {
                current[key] = value
            }
        }
    }

}
