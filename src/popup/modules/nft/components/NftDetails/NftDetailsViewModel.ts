import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem, Nft } from '@app/models'
import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { accountExplorerLink, Logger } from '@app/shared'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class NftDetailsViewModel {

    public nft!: Nft

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftDetailsViewModel, any>(this, {
            rpcStore: false,
            logger: false,
            disposer: false,
        }, { autoBind: true })

    }

    public get canTransfer(): boolean {
        return this.nft.owner === this.nft.manager
    }

    private get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public getExplorerLink(address: string): string {
        const network = this.selectedConnection.group
        return accountExplorerLink({ network, address })
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
