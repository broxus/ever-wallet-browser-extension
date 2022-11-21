import { Mutex } from '@broxus/await-semaphore'
import type { ContractUpdatesSubscription, ProviderEvent, RawProviderEventData } from 'everscale-inpage-provider'
import type nt from '@wallet/nekoton-wasm'

import { SendMessageCallback } from '@app/shared'
import { NekotonRpcError, RpcErrorCode } from '@app/models'

import { IContractHandler } from '../utils/ContractSubscription'
import { GenericContractSubscription } from '../utils/GenericContractSubscription'
import { BaseConfig, BaseController, BaseState } from './BaseController'
import { ConnectionController } from './ConnectionController'

const DEFAULT_POLLING_INTERVAL = 10000 // 10s

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

// eslint-disable-next-line max-len
export class StandaloneSubscriptionController extends BaseController<SubscriptionControllerConfig, SubscriptionControllerState> {

    private readonly _subscriptions: Map<string, GenericContractSubscription> = new Map()

    private readonly _subscriptionsMutex: Mutex = new Mutex()

    private readonly _sendMessageRequests: Map<string, Map<string, SendMessageCallback>> = new Map()

    private readonly _tabSubscriptions: Map<string, ContractUpdatesSubscription> = new Map()

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

            let shouldUnsubscribe = true
            const currentParams = this._tabSubscriptions.get(address) || makeDefaultSubscriptionState()

            for (const k of Object.keys(currentParams)) {
                const key = k as keyof ContractUpdatesSubscription
                const value = params[key]

                if (typeof value === 'boolean') {
                    currentParams[key] = value
                }

                shouldUnsubscribe &&= !currentParams[key]
            }

            if (shouldUnsubscribe) {
                this._tabSubscriptions.delete(address)
                await this._tryUnsubscribe(address)
                return currentParams
            }

            let existingSubscription = this._subscriptions.get(address)
            const newSubscription = existingSubscription == null
            if (existingSubscription == null) {
                existingSubscription = await this._createSubscription(address)
            }

            this._tabSubscriptions.set(address, currentParams)

            if (newSubscription) {
                await existingSubscription.start()
            }

            return currentParams
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
    ): Promise<nt.Transaction> {
        await this.subscribeToContract(address, { state: true })

        const subscription = this._subscriptions.get(address)

        if (subscription == null) {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                'Failed to subscribe to contract',
            )
        }

        return subscription.use(async contract => {
            try {
                return await contract.sendMessageLocally(signedMessage)
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
        let messageRequests = await this._sendMessageRequests.get(address)
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
            await this.subscribeToContract(address, { state: true })
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
                    subscription.skipRefreshTimer()
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

    private async _createSubscription(address: string) {
        class ContractHandler implements IContractHandler<nt.Transaction> {

            private readonly _address: string

            private readonly _controller: StandaloneSubscriptionController

            private _enabled: boolean = false

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
                    .catch(console.error)
            }

            onMessageSent(pendingTransaction: nt.PendingTransaction, transaction: nt.Transaction) {
                if (!this._enabled) return

                this._controller
                    ._resolveMessageRequest(
                        this._address,
                        pendingTransaction.messageHash,
                        transaction,
                    )
                    .catch(console.error)
            }

            onStateChanged(newState: nt.ContractState) {
                if (!this._enabled) return

                this._controller._notifyStateChanged(this._address, newState)
            }

            onTransactionsFound(transactions: Array<nt.Transaction>, info: nt.TransactionsBatchInfo) {
                if (!this._enabled) return

                this._controller._notifyTransactionsFound(this._address, transactions, info)
            }

        }

        const handler = new ContractHandler(address, this)

        const subscription = await GenericContractSubscription.subscribe(
            this.config.clock,
            this.config.connectionController,
            address,
            handler,
        )
        subscription.setPollingInterval(DEFAULT_POLLING_INTERVAL)
        handler.enableNotifications()
        this._subscriptions.set(address, subscription)

        return subscription
    }

    private async _tryUnsubscribe(address: string) {
        const subscription = this._tabSubscriptions.get(address)
        const sendMessageRequests = this._sendMessageRequests.get(address)
        if (!subscription && (sendMessageRequests?.size ?? 0) === 0) {
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

    private _notifyStateChanged(address: string, state: nt.ContractState) {
        const notifyState = this._tabSubscriptions.get(address)?.state
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
    ) {
        console.debug('Transactions found', transactions, info, this._tabSubscriptions)

        const notifyTransactions = this._tabSubscriptions.get(address)?.transactions
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

}
