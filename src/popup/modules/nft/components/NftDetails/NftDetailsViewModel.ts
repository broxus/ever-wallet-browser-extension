import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { EVERNAME_ADDRESS, NFT_MARKETPLACE_URL } from '@app/shared'
import { Nft, NftCollection } from '@app/models'
import { ConnectionStore, RpcStore } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

import { NftStore } from '../../store'
import browser from 'webextension-polyfill'

@injectable()
export class NftDetailsViewModel {

    public nft!: Nft

    constructor(
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
        private nftStore: NftStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

    }

    public get canTransfer(): boolean {
        return this.nft.owner === this.nft.manager
    }

    public get collection(): NftCollection | undefined {
        return this.nftStore.collections[this.nft.collection]
    }

    public get isEvername(): boolean {
        return this.collection?.address === EVERNAME_ADDRESS
    }

    public getExplorerLink(address: string): string {
        return this.connectionStore.accountExplorerLink(address)
    }

    public async onTransfer(): Promise<void> {
        await this.rpcStore.rpc.tempStorageInsert('selected_nft', this.nft.address)
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'transfer_nft',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async openMarketplace(): Promise<void> {
        await browser.tabs.create({
            url: `${NFT_MARKETPLACE_URL}/${this.nft.address}`,
            active: false,
        })
    }

}
