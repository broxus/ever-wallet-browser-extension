import { makeAutoObservable, reaction } from 'mobx'
import { Disposable, injectable } from 'tsyringe'

import { NetworkGroup, NftCollection, PendingNft } from '@app/models'
import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

import { NftStore } from '../../store'

@injectable()
export class NftCollectionsViewModel implements Disposable {

    private loading = new Set<string>()

    private readonly disposer: () => void

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftCollectionsViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            nftStore: false,
            logger: false,
            disposer: false,
            loading: false,
        }, { autoBind: true })

        this.disposer = reaction(
            () => `${this.connectionGroup}_${this.selectedAccountAddress}_${Object.keys(this.pendingNfts ?? {}).length}`,
            () => this.updateCollections(),
            { fireImmediately: true },
        )
    }

    public dispose(): Promise<void> | void {
        this.disposer()
    }

    public get accountCollections(): NftCollection[] {
        const owner = this.selectedAccountAddress
        const collections = this.nftStore.accountNftCollections[owner] ?? []
        const visibility = this.nftCollectionsVisibility[owner]

        if (visibility) {
            return collections.filter(({ address }) => visibility[address] !== false)
        }

        return collections
    }

    public get pendingNfts(): Record<string, PendingNft[]> | undefined {
        return this.nftStore.accountPendingNfts[this.selectedAccountAddress]
    }

    private get selectedAccountAddress(): string {
        return this.accountability.selectedAccountAddress!
    }

    private get nftCollectionsVisibility() {
        return this.rpcStore.state.nftCollectionsVisibility
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    private async updateCollections(): Promise<void> {
        const owner = this.selectedAccountAddress

        if (this.loading.has(owner)) return

        try {
            await this.nftStore.scanNftCollections(owner)
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            this.loading.delete(owner)
        }
    }

}
