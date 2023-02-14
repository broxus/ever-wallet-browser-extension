import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { NetworkGroup, NftCollection, NftTransfer } from '@app/models'
import { AccountabilityStore, Logger, RpcStore, Utils } from '@app/popup/modules/shared'

import { GridStore, NftStore } from '../../store'

@injectable()
export class NftCollectionsViewModel {

    private loading = new Set<string>()

    constructor(
        public grid: GridStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.reaction(
            () => `${this.connectionGroup}_${this.selectedAccountAddress}_${Object.keys(this.pendingNfts ?? {}).length}`,
            () => this.updateCollections(),
            { fireImmediately: true },
        )

        utils.autorun(async () => {
            const owner = this.selectedAccountAddress
            const transferred = this.nftStore.transferredNfts
            const isCurrent = transferred.some((nft) => nft.oldOwner === owner)

            if (isCurrent) {
                await this.updateCollections()
            }
        })
    }

    public get accountCollections(): NftCollection[] {
        const owner = this.selectedAccountAddress
        const visibility = this.nftCollectionsVisibility[owner]
        let collections = this.nftStore.accountNftCollections[owner] ?? []

        if (visibility) {
            collections = collections.filter(({ address }) => visibility[address] !== false)
        }

        return collections.sort((a, b) => a.name.localeCompare(b.name))
    }

    public get pendingNfts(): Record<string, NftTransfer[]> | undefined {
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
