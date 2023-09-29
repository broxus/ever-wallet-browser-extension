import type * as nt from '@broxus/ever-wallet-wasm'
import { computed, makeObservable, observable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { AccountabilityStore, Logger, RpcStore, TransferStore, Utils } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { MessageAmount, Nft } from '@app/models'

import { NftStore } from './NftStore'

type AdditionalKeys = '_nft'

@singleton()
export class NftTransferStore extends TransferStore<MessageParams> {

    private _nft: Nft | undefined

    constructor(
        public ledger: LedgerUtils,
        private nftStore: NftStore,
        rpcStore: RpcStore,
        accountability: AccountabilityStore,
        logger: Logger,
        utils: Utils,
    ) {
        super(rpcStore, accountability, logger, ledger, utils)
        makeObservable<NftTransferStore, AdditionalKeys>(this, {
            _nft: observable,
            nft: computed,
        })
    }

    public get nft(): Nft {
        if (!this._nft) throw new Error('[NftTransferStore] not initialized')
        return this._nft
    }

    protected async initialize(account: nt.AssetsList): Promise<void> {
        try {
            const address = await this.rpcStore.rpc.tempStorageRemove('selected_nft') as string
            const nft = await this.nftStore.getNft(address)

            if (!nft) throw new Error(`Nft not found (${address})`)

            await this.nftStore.getNftCollections([nft.collection])

            runInAction(() => {
                this._account = account
                this._nft = nft
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
