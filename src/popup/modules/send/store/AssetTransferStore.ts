import type * as nt from '@broxus/ever-wallet-wasm'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { SelectedAsset } from '@app/shared'
import { AccountabilityStore, LocalizationStore, Logger, RpcStore, TransferStore, Utils } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { MessageAmount } from '@app/models'

type AdditionalKeys =
    | '_asset'
    | '_initialAddress'

@singleton() // singleton due to separate window (change to injectable + child container in other case)
export class AssetTransferStore extends TransferStore<MessageParams> {

    private _asset: SelectedAsset | undefined

    private _initialAddress = ''

    constructor(
        public ledger: LedgerUtils,
        rpcStore: RpcStore,
        accountability: AccountabilityStore,
        localization: LocalizationStore,
        logger: Logger,
        utils: Utils,
    ) {
        super(rpcStore, accountability, logger, ledger, utils, localization)
        makeObservable<AssetTransferStore, AdditionalKeys>(this, {
            _asset: observable,
            _initialAddress: observable,
            asset: computed,
            initialAddress: computed,
            setAsset: action.bound,
        })
    }

    public get asset(): SelectedAsset {
        if (!this._asset) throw new Error('[SendPageStore] not initialized')
        return this._asset
    }

    public get initialAddress(): string {
        return this._initialAddress
    }

    public setAsset(asset: SelectedAsset): void {
        this._asset = asset
    }

    protected async initialize(account: nt.AssetsList): Promise<void> {
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
            this._account = account
            this._asset = asset ?? {
                type: 'ever_wallet',
                data: { address: account.tonWallet.address },
            }
            this._initialAddress = address ?? ''
        })
    }

}

export interface MessageParams {
    amount: MessageAmount;
    originalAmount: string;
    recipient: string;
    notify: boolean;
    comment?: string;
}
