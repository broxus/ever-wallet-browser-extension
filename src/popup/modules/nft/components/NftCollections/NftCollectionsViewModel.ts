import { autorun, makeAutoObservable, reaction } from 'mobx'
import { Disposable, injectable } from 'tsyringe'

import { NetworkGroup, NftCollection, NftTransfer } from '@app/models'
import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

import { GridStore, NftStore } from '../../store'

@injectable()
export class NftCollectionsViewModel implements Disposable {

    private loading = new Set<string>()

    private readonly updateDisposer: () => void

    private readonly transferDisposer: () => void

    constructor(
        public grid: GridStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftCollectionsViewModel, any>(this, {
            grid: false,
            rpcStore: false,
            accountability: false,
            nftStore: false,
            logger: false,
            disposer: false,
            loading: false,
        }, { autoBind: true })

        this.updateDisposer = reaction(
            () => `${this.connectionGroup}_${this.selectedAccountAddress}_${Object.keys(this.pendingNfts ?? {}).length}`,
            () => this.updateCollections(),
            { fireImmediately: true },
        )

        this.transferDisposer = autorun(async () => {
            const owner = this.selectedAccountAddress
            const transferred = this.nftStore.transferredNfts
            const isCurrent = transferred.some((nft) => nft.oldOwner === owner)

            if (isCurrent) {
                await this.updateCollections()
            }
        })
    }

    public dispose(): Promise<void> | void {
        this.updateDisposer()
        this.transferDisposer()
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
