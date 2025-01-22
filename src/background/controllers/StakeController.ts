import type * as nt from '@broxus/ever-wallet-wasm'
import { Mutex } from '@broxus/await-semaphore'
import type { AbiEventName, AbiParam, DecodedAbiEventData } from 'everscale-inpage-provider'
import { Address, parseTokensObject } from 'everscale-inpage-provider'

import { StEverAccountAbi, StEverVaultAbi } from '@app/abi'
import type { Nekoton, StEverVaultDetails, WithdrawRequest } from '@app/models'
import { ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG, ST_EVER_VAULT_ADDRESS_CONFIG } from '@app/shared'

import { BACKGROUND_POLLING_INTERVAL, ST_EVER_VAULT_POLLING_INTERVAL } from '../constants'
import { Contract, ContractFactory, ContractFunction } from '../utils/Contract'
import { IContractHandler } from '../utils/ContractSubscription'
import { GenericContractSubscription } from '../utils/GenericContractSubscription'
import { BaseConfig, BaseController, BaseState } from './BaseController'
import { ConnectionController } from './ConnectionController'
import { AccountController, AccountControllerState } from './AccountController/AccountController'

type VaultAbi = typeof StEverVaultAbi
type AccountAbi = typeof StEverAccountAbi

const stEverVaultABI = JSON.stringify(StEverVaultAbi)
const VAULT_EVENTS = ((StEverVaultAbi as any).events as ContractFunction[]).reduce((events, item) => {
    events[item.name] = { inputs: item.inputs || [] }
    return events
}, {} as Record<string, { inputs: AbiParam[] }>)

interface StakeControllerConfig extends BaseConfig {
    nekoton: Nekoton;
    clock: nt.ClockWithOffset;
    connectionController: ConnectionController;
    accountController: AccountController;
    contractFactory: ContractFactory;
}

interface StakeControllerState extends BaseState {
    withdrawRequests: Record<string, Record<string, WithdrawRequest>>
}

function makeDefaultState(): StakeControllerState {
    return {
        withdrawRequests: {},
    }
}

export class StakeController extends BaseController<StakeControllerConfig, StakeControllerState> {

    private readonly _mutex = new Mutex()

    private _prevAccountState: AccountControllerState | undefined

    private _accountAddresses = new Set<string>()

    private _vaultContractSubscription: GenericContractSubscription | undefined

    private _accountStateListener = (state: AccountControllerState) => this._handleAccountStateUpdate(state)

    constructor(
        config: StakeControllerConfig,
        state?: StakeControllerState,
    ) {
        super(config, state ?? makeDefaultState())

        this.initialize()
    }

    public initialSync(): void {

    }

    private get stEverVaultAddress(): string | undefined {
        const { selectedConnection } = this.config.connectionController.state
        return ST_EVER_VAULT_ADDRESS_CONFIG[selectedConnection.group]
    }

    private get stEverTokenRootAddress(): string | undefined {
        const { selectedConnection } = this.config.connectionController.state
        return ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG[selectedConnection.group]
    }

    public async startSubscriptions(): Promise<void> {
        await this._mutex.use(async () => {
            if (!this.stEverVaultAddress) return

            await this._handleAccountStateUpdate()

            this.config.accountController.subscribe(this._accountStateListener)
            this._vaultContractSubscription = await this._createVaultSubscription(this.stEverVaultAddress)
            await this._vaultContractSubscription.start()
        })
    }

    public async stopSubscriptions(): Promise<void> {
        await this._mutex.use(async () => {
            this.config.accountController.unsubscribe(this._accountStateListener)
            await this._vaultContractSubscription?.stop()
            this._vaultContractSubscription = undefined
        })

        this.update({
            withdrawRequests: {},
        })
    }

    public enableIntensivePolling() {
        this._vaultContractSubscription?.skipRefreshTimer()
        this._vaultContractSubscription?.setPollingInterval(ST_EVER_VAULT_POLLING_INTERVAL)
    }

    public disableIntensivePolling() {
        this._vaultContractSubscription?.setPollingInterval(BACKGROUND_POLLING_INTERVAL)
    }

    public async getStakeDetails(): Promise<StEverVaultDetails> {
        const contract = this._getVaultContract()
        const { value0 } = await contract.call('getDetails', {
            answerId: 0,
        }, { responsible: true })

        return value0
    }

    public async getDepositStEverAmount(amount: string): Promise<string> {
        const contract = this._getVaultContract()
        const { value0 } = await contract.call('getDepositStEverAmount', {
            _amount: amount,
        })

        return value0
    }

    public async getWithdrawEverAmount(amount: string): Promise<string> {
        const contract = this._getVaultContract()
        const { value0 } = await contract.call('getWithdrawEverAmount', {
            _amount: amount,
        })

        return value0
    }

    public async encodeDepositPayload(): Promise<string> {
        const contract = this._getVaultContract()
        const { depositPayload } = await contract.call('encodeDepositPayload', {
            _nonce: Date.now().toString(),
        })

        return depositPayload
    }

    private async _createVaultSubscription(address: string): Promise<GenericContractSubscription> {
        class ContractHandler implements IContractHandler<nt.Transaction> {

            private readonly _address: string

            private readonly _controller: StakeController

            constructor(address: string, controller: StakeController) {
                this._address = address
                this._controller = controller
            }

            onMessageExpired(): void {}

            onMessageSent(): void {}

            onStateChanged(): void {}

            onTransactionsFound(transactions: Array<nt.Transaction>): void {
                this._controller._handleTransactionsFound(this._address, transactions)
            }

        }

        const handler = new ContractHandler(address, this)

        const subscription = await GenericContractSubscription.subscribe(
            this.config.clock,
            this.config.connectionController,
            address,
            handler,
        )

        return subscription
    }

    private _handleTransactionsFound(_address: string, transactions: nt.Transaction[]): void {
        const withdrawRequests: Record<string, Record<string, WithdrawRequest>> = {}
        let updated = false

        for (const transaction of transactions) {
            let events: nt.DecodedTransactionEvents

            try {
                events = this.config.nekoton.decodeTransactionEvents(transaction, stEverVaultABI)
            }
            catch {
                continue
            }

            for (const { event, data } of events) {
                const address = data.user?.toString()

                if (
                    (event !== 'WithdrawRequest' && event !== 'WithdrawSuccess' && event !== 'WithdrawRequestRemoved')
                    || !address
                    || !this._accountAddresses.has(address)
                ) continue

                if (!withdrawRequests[address]) {
                    withdrawRequests[address] = this.state.withdrawRequests[address] ?? {}
                }

                if (event === 'WithdrawRequest') {
                    const { amount, nonce, unlockTime } = parseVaultEvent('WithdrawRequest', data)

                    withdrawRequests[address][nonce] = [
                        nonce,
                        { amount, unlockTime, timestamp: transaction.createdAt.toString() },
                    ]
                }
                else if (event === 'WithdrawSuccess') {
                    const { withdrawInfo } = parseVaultEvent('WithdrawSuccess', data)

                    for (const [nonce] of withdrawInfo) {
                        delete withdrawRequests[address][nonce]
                    }
                }
                else if (event === 'WithdrawRequestRemoved') {
                    const { nonce } = parseVaultEvent('WithdrawRequestRemoved', data)
                    delete withdrawRequests[address][nonce]
                }

                updated = true
            }
        }

        if (updated) {
            this.update({
                withdrawRequests,
            })
        }
    }

    private async _handleAccountStateUpdate(
        state = this.config.accountController.state,
    ): Promise<void> {
        const { selectedAccountAddress, accountEntries } = state ?? this.config.accountController.state
        const {
            selectedAccountAddress: prevSelectedAccountAddress,
            accountEntries: prevAccountEntries,
        } = this._prevAccountState ?? {}

        this._prevAccountState = state

        if (prevAccountEntries !== accountEntries) {
            this._accountAddresses = new Set<string>(
                Object.keys(accountEntries),
            )
        }

        if (prevSelectedAccountAddress !== selectedAccountAddress && selectedAccountAddress) {
            await this._updateAccountWithdrawRequests(selectedAccountAddress)
        }
    }

    private async _updateAccountWithdrawRequests(address: string): Promise<void> {
        const requests = await this._getWithdrawRequests(address)
        const { withdrawRequests } = this.state

        this.update({
            withdrawRequests: {
                ...withdrawRequests,
                [address]: requests?.reduce((result, request) => {
                    const [nonce] = request
                    result[nonce] = request
                    return result
                }, {} as Record<string, WithdrawRequest>) ?? {},
            },
        })
    }

    private async _getWithdrawRequests(address: string): Promise<WithdrawRequest[] | undefined> {
        try {
            const vaultContract = this._getVaultContract()
            const { value0: userDataAddress } = await vaultContract.call('getAccountAddress', {
                _user: new Address(address),
                answerId: 0,
            }, { responsible: true })

            const accountContract = this._getAccountContract(userDataAddress.toString())
            const { withdrawRequests } = await accountContract.call('withdrawRequests', {})

            return withdrawRequests
        }
        catch {}

        return undefined
    }

    private _getVaultContract(): Contract<VaultAbi> {
        const address = this.stEverVaultAddress

        if (!address) throw new Error('Unsupported network')

        return this.config.contractFactory.create(StEverVaultAbi, address)
    }

    private _getAccountContract(address: string): Contract<AccountAbi> {
        return this.config.contractFactory.create(StEverAccountAbi, address)
    }

}

function parseVaultEvent<T extends AbiEventName<VaultAbi>>(
    name: T,
    data: nt.TokensObject,
): DecodedAbiEventData<VaultAbi, T> {
    return parseTokensObject(VAULT_EVENTS[name].inputs, data) as DecodedAbiEventData<VaultAbi, T>
}
