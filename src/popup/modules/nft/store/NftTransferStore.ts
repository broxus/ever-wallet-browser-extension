import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { AccountabilityStore, Logger, RpcStore, SelectableKeys, Utils } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { MessageAmount, Nft, TransferMessageToPrepare, WalletMessageToSend } from '@app/models'

import { NftStore } from './NftStore'

@singleton()
export class NftTransferStore {

    public ledgerConnect = false

    private _initialized = false

    private _account: nt.AssetsList | undefined

    private _key: nt.KeyStoreEntry | undefined

    private _messageParams: MessageParams | undefined

    private _messageToPrepare: TransferMessageToPrepare | undefined

    private _fees = ''

    private _nft: Nft | undefined

    constructor(
        public ledger: LedgerUtils,
        private nftStore: NftStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
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
    }

    public get initialized(): boolean {
        return this._initialized
    }

    public get nft(): Nft {
        if (!this._nft) throw new Error('[NftTransferStore] not initialized')
        return this._nft
    }

    public get account(): nt.AssetsList {
        if (!this._account) throw new Error('[NftTransferStore] not initialized')
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

    public handleLedgerConnected(): void {
        this.ledgerConnect = false
    }

    public setKey(key: nt.KeyStoreEntry): void {
        this._key = key
    }

    public submitMessageParams(messageParams: MessageParams, messageToPrepare: TransferMessageToPrepare): void {
        this._messageParams = messageParams
        this._messageToPrepare = messageToPrepare
        this.estimateFees(messageToPrepare)
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
    }

    private async estimateFees(params: TransferMessageToPrepare) {
        this._fees = ''

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

    private prepareMessage(
        params: TransferMessageToPrepare,
        password: nt.KeyPassword,
    ): Promise<nt.SignedMessage> {
        return this.rpcStore.rpc.prepareTransferMessage(this.account.tonWallet.address, params, password)
    }

    private sendMessage(message: WalletMessageToSend): Promise<void> {
        return this.rpcStore.rpc.sendMessage(this.account.tonWallet.address, message)
    }

    private async initialize(): Promise<void> {
        try {
            const address = await this.rpcStore.rpc.tempStorageRemove('selected_nft') as string
            const nft = await this.nftStore.getNft(address)

            if (!nft) throw new Error(`Nft not found (${address})`)

            await this.nftStore.getNftCollections([nft.collection])

            runInAction(() => {
                this._account = this.accountability.selectedAccount!
                this._nft = nft
                this._initialized = true
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}

export interface MessageParams {
    amount: Extract<MessageAmount, { type: 'ever_wallet' }>;
    recipient: string;
    count?: string;
}
