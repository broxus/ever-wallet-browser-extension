import type nt from '@wallet/nekoton-wasm'
import { Mutex } from '@broxus/await-semaphore'
import {
    parseTokensObject,
    ContractFunction,
    AbiParam,
    Address,
    DecodedAbiEventData,
    AbiEventName,
} from 'everscale-inpage-provider'
import browser from 'webextension-polyfill'

import { StEverVaultABI, StEverAccountABI } from '@app/abi'
import {
    Nekoton,
    StakeBannerState,
    StEverVaultDetails,
    WithdrawRequest,
    TokenMessageToPrepare,
    NekotonRpcError,
    RpcErrorCode,
} from '@app/models'
import { ST_EVER_VAULT_ADDRESS_CONFIG, ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG } from '@app/shared'

import { DEFAULT_POLLING_INTERVAL } from '../constants'
import { Contract, ContractFactory } from '../utils/Contract'
import { IContractHandler } from '../utils/ContractSubscription'
import { GenericContractSubscription } from '../utils/GenericContractSubscription'
import { BaseConfig, BaseController, BaseState } from './BaseController'
import { ConnectionController } from './ConnectionController'
import { AccountController, AccountControllerState } from './AccountController/AccountController'
import {
    ITokenWalletHandler,
    TokenWalletSubscription,
} from './AccountController/TokenWalletSubscription'

type VaultAbi = typeof StEverVaultABI
type AccountAbi = typeof StEverAccountABI

const stEverVaultABI = JSON.stringify(StEverVaultABI)
const VAULT_EVENTS = ((StEverVaultABI as any).events as ContractFunction[]).reduce((events, item) => {
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
    stakeBannerState: StakeBannerState
    withdrawRequests: Record<string, Record<string, WithdrawRequest>>
}

function makeDefaultState(): StakeControllerState {
    return {
        stakeBannerState: 'visible',
        withdrawRequests: {},
    }
}

export class StakeController extends BaseController<StakeControllerConfig, StakeControllerState> {

    private readonly _mutex = new Mutex()

    private readonly _tokenWalletSubscriptions = new Map<string, TokenWalletSubscription>()

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

    public async initialSync(): Promise<void> {
        const stakeBannerState = await this._loadBannerState() ?? 'visible'

        this.update({
            stakeBannerState,
        })
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

            await Promise.all(
                Array.from(this._tokenWalletSubscriptions.values()).map((item) => item.stop()),
            )
            this._tokenWalletSubscriptions.clear()
        })

        this.update({
            withdrawRequests: {},
        })
    }

    public async setStakeBannerState(stakeBannerState: StakeBannerState): Promise<void> {
        this.update({ stakeBannerState })
        await this._saveBannerState()
    }

    public async getStakeDetails(): Promise<StEverVaultDetails> {
        const contract = this._getVaultContract()
        const { value0 } = await contract.call('getDetails', {
            answerId: 0,
        })

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

    public async getStEverBalance(address: string): Promise<string> {
        const subscription = await this._mutex.use(() => this._getTokenWalletSubscription(address))

        return subscription.use(async (wallet) => {
            await wallet.refresh()
            return wallet.balance
        })
    }

    public async prepareStEverMessage(owner: string, params: TokenMessageToPrepare) {
        const subscription = await this._mutex.use(() => this._getTokenWalletSubscription(owner))

        return subscription.use(async wallet => {
            try {
                return await wallet.prepareTransfer(
                    params.recipient,
                    params.amount,
                    params.payload || '',
                    params.notifyReceiver,
                )
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
        })
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
        subscription.setPollingInterval(DEFAULT_POLLING_INTERVAL)

        return subscription
    }

    private async _getTokenWalletSubscription(owner: string): Promise<TokenWalletSubscription> {
        const rootTokenContract = this.stEverTokenRootAddress
        let subscription = this._tokenWalletSubscriptions.get(owner)

        if (!rootTokenContract) throw new Error('Unsupported network')

        if (subscription) {
            return subscription
        }

        subscription = await TokenWalletSubscription.subscribe(
            this.config.connectionController,
            owner,
            rootTokenContract,
            new TokenWalletHandler(),
        )

        this._tokenWalletSubscriptions.set(owner, subscription)

        return subscription
    }

    private _handleTransactionsFound(_address: string, transactions: nt.Transaction[]): void {
        const update: Record<string, Record<string, WithdrawRequest>> = {}
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

                if (!update[address]) {
                    update[address] = this.state.withdrawRequests[address] ?? {}
                }

                if (event === 'WithdrawRequest') {
                    const { amount, nonce } = parseVaultEvent('WithdrawRequest', data)

                    update[address][nonce] = [nonce, { amount, timestamp: transaction.createdAt.toString() }]
                }
                else if (event === 'WithdrawSuccess') {
                    const { withdrawInfo } = parseVaultEvent('WithdrawSuccess', data)

                    for (const [nonce] of withdrawInfo) {
                        delete update[address][nonce]
                    }
                }
                else if (event === 'WithdrawRequestRemoved') {
                    const { nonce } = parseVaultEvent('WithdrawRequestRemoved', data)
                    delete update[address][nonce]
                }

                updated = true
            }
        }

        if (updated) {
            this.update(update)
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
            })

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

        return this.config.contractFactory.create(StEverVaultABI, address)
    }

    private _getAccountContract(address: string): Contract<AccountAbi> {
        return this.config.contractFactory.create(StEverAccountABI, address)
    }

    private async _loadBannerState(): Promise<StakeBannerState | undefined> {
        const { stakeBannerState } = await browser.storage.local.get('stakeBannerState')
        if (typeof stakeBannerState === 'string') {
            return stakeBannerState as StakeBannerState
        }

        return undefined
    }

    private async _saveBannerState(): Promise<void> {
        await browser.storage.local.set({ stakeBannerState: this.state.stakeBannerState })
    }

}

function parseVaultEvent<T extends AbiEventName<VaultAbi>>(
    name: T,
    data: nt.TokensObject,
): DecodedAbiEventData<VaultAbi, T> {
    return parseTokensObject(VAULT_EVENTS[name].inputs, data) as DecodedAbiEventData<VaultAbi, T>
}

class TokenWalletHandler implements ITokenWalletHandler {

    onBalanceChanged() {}

    onTransactionsFound() {}

}
