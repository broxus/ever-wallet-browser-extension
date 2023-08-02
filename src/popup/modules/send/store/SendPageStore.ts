import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { SelectedAsset } from '@app/shared'
import { AccountabilityStore, Logger, RpcStore, SelectableKeys, Utils } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { MessageAmount } from '@app/models'

// TODO: generic shared transaction store?
@singleton() // singleton due to separate window (change to injectable + child container in other case)
export class SendPageStore {

    private _initialized = false

    private _asset: SelectedAsset | undefined

    private _account: nt.AssetsList | undefined

    private _key: nt.KeyStoreEntry | undefined

    private _messageParams: MessageParams | undefined

    private _initialAddress = ''

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
        private utils: Utils,
        private ledger: LedgerUtils,
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
                console.error('Not implemented!')
                // TODO: navigate to connect
                // this.step.setValue(Step.LedgerConnect)
            }
        })
    }

    public get initialized(): boolean {
        return this._initialized
    }

    public get account(): nt.AssetsList {
        if (!this._account) throw new Error('[SendPageStore] not initialized')
        return this._account
    }

    public get asset(): SelectedAsset {
        if (!this._asset) throw new Error('[SendPageStore] not initialized')
        return this._asset
    }

    public get key(): nt.KeyStoreEntry | undefined {
        return this._key
    }

    public get initialAddress(): string {
        return this._initialAddress
    }

    public get messageParams(): MessageParams | undefined {
        return this._messageParams
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys(this.account)
    }

    public setAsset(asset: SelectedAsset): void {
        this._asset = asset
    }

    public setKey(key: nt.KeyStoreEntry): void {
        this._key = key
    }

    public setMessageParams(params: MessageParams): void {
        this._messageParams = params
    }

    private async initialize(): Promise<void> {
        let asset: SelectedAsset | null = null,
            address: string | null = null

        try {
            asset = await this.rpcStore.rpc.tempStorageRemove('selected_asset') as SelectedAsset
            address = await this.rpcStore.rpc.tempStorageRemove('selected_address') as string
        }
        catch (e) {
            this.logger.error(e)
        }

        runInAction(() => {
            this._account = this.accountability.selectedAccount!
            this._asset = asset ?? {
                type: 'ever_wallet',
                data: { address: this._account.tonWallet.address },
            }
            this._initialAddress = address ?? ''
            this._initialized = true
        })
    }

}

export interface MessageParams {
    amount: MessageAmount;
    originalAmount: string;
    recipient: string;
    comment?: string;
}
