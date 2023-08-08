import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, Logger, RpcStore, SelectableKeys, StakeStore, Utils } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { MessageAmount, TransferMessageToPrepare, WalletMessageToSend } from '@app/models'

@singleton()
export class StakeTransferStore {

    public ledgerConnect = false

    private _initialized = false

    private _account: nt.AssetsList | undefined

    private _key: nt.KeyStoreEntry | undefined

    private _messageParams: MessageParams | undefined

    private _messageToPrepare: TransferMessageToPrepare | undefined

    private _fees = ''

    private _stEverBalance = '0'

    constructor(
        public ledger: LedgerUtils,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.when(() => {
            const { selectedAccount, everWalletState } = this.accountability
            return !!selectedAccount && !!everWalletState
        }, () => this.initialize())

        utils.when(() => this.initialized && !!this.selectableKeys.keys[0], () => {
            this._key = this.selectableKeys.keys[0]
        })

        utils.when(() => this._key?.signerName === 'ledger_key', async () => {
            const connected = await ledger.checkLedger()
            if (!connected) {
                runInAction(() => {
                    this.ledgerConnect = true
                })
            }
        })

        utils.autorun(() => {
            if (this.messageToPrepare) {
                this.estimateFees(this.messageToPrepare).catch(logger.error)
            }
        })

        utils.when(() => this.initialized, () => {
            this.stakeStore.getDetails().catch(this.logger.error)
            this.updateStEverBalance().catch(this.logger.error)
        })

        utils.interval(this.updateStEverBalance, 10_000)
    }

    public get initialized(): boolean {
        return this._initialized
    }

    public get account(): nt.AssetsList {
        if (!this._account) throw new Error('[StakeTransferStore] not initialized')
        return this._account
    }

    public get key(): nt.KeyStoreEntry | undefined {
        return this._key
    }

    public get messageParams(): MessageParams | undefined {
        return this._messageParams
    }

    public get messageToPrepare(): TransferMessageToPrepare | undefined {
        return this._messageToPrepare
    }

    public get fees(): string {
        return this._fees
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys(this.account)
    }

    public get stEverBalance(): string {
        return this._stEverBalance
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        const { group } = this.connectionStore.selectedConnection
        return this.account.additionalAssets[group]?.tokenWallets ?? []
    }

    public handleLedgerConnected(): void {
        this.ledgerConnect = false
    }

    public setKey(key: nt.KeyStoreEntry): void {
        this._key = key
    }

    public submitMessageParams(messageParams: MessageParams, messageToPrepare: TransferMessageToPrepare): void {
        this._messageParams = messageParams
        this._messageToPrepare = messageToPrepare
    }

    public resetMessageParams(): void {
        this._messageParams = undefined
        this._messageToPrepare = undefined
    }

    public async submitPassword(password: nt.KeyPassword): Promise<void> {
        const messageToPrepare = this.messageToPrepare!
        const signedMessage = await this.prepareMessage(messageToPrepare, password)

        await this.sendMessage({
            signedMessage,
            info: {
                type: 'transfer',
                data: {
                    amount: messageToPrepare.amount,
                    recipient: messageToPrepare.recipient,
                },
            },
        })

        if (this.messageParams?.action === 'stake') {
            await this.updateTokenVisibility()
        }
    }

    private initialize(): void {
        this._account = this.accountability.selectedAccount!
        this._initialized = true
    }

    private prepareMessage(
        params: TransferMessageToPrepare,
        password: nt.KeyPassword,
    ): Promise<nt.SignedMessage> {
        return this.rpcStore.rpc.prepareTransferMessage(this.account.tonWallet.address, params, password)
    }

    private sendMessage(message: WalletMessageToSend): Promise<void> {
        return this.rpcStore.rpc.sendMessage(this.account.tonWallet.address, message)
    }

    private async estimateFees(params: TransferMessageToPrepare) {
        try {
            const fees = await this.rpcStore.rpc.estimateFees(this.account.tonWallet.address, params, {})

            runInAction(() => {
                this._fees = fees
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private async updateStEverBalance(): Promise<void> {
        if (!this._account) return

        try {
            const balance = await this.rpcStore.rpc.getTokenBalance(
                this._account.tonWallet.address,
                this.stakeStore.stEverTokenRoot,
            )
            runInAction(() => {
                this._stEverBalance = balance
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private async updateTokenVisibility(): Promise<void> {
        const { address } = this.account.tonWallet
        const { stEverTokenRoot } = this.stakeStore
        const hasStEverAsset = this.tokenWalletAssets
            .some(({ rootTokenContract }) => rootTokenContract === stEverTokenRoot)

        if (!hasStEverAsset) {
            await this.rpcStore.rpc.updateTokenWallets(address, {
                [this.stakeStore.stEverTokenRoot]: true,
            })
        }
    }

}

export interface MessageParams {
    amount: MessageAmount;
    originalAmount: string;
    action: 'stake' | 'unstake' | 'cancel';
}
