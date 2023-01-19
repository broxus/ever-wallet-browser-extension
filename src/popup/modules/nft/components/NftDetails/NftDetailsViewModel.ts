import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Nft } from '@app/models'
import { ConnectionStore, RpcStore } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class NftDetailsViewModel {

    public nft!: Nft

    constructor(
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

    }

    public get canTransfer(): boolean {
        return this.nft.owner === this.nft.manager
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

}
