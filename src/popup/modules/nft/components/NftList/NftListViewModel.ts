import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { NetworkGroup, Nft, NftCollection } from '@app/models'
import { AccountabilityStore, DrawerContext, RpcStore } from '@app/popup/modules/shared'
import { accountExplorerLink, Logger } from '@app/shared'

import { GridStore, NftStore } from '../../store'

const LIMIT = 8

@injectable()
export class NftListViewModel {

    public collection!: NftCollection

    public drawer!: DrawerContext

    public nfts: Nft[] = []

    public selectedNft: Nft | undefined

    public hasMore = true

    public dropdownActive = false

    public expanded: boolean | undefined

    public pending: Set<string> | undefined

    private loading = false

    private continuation: string | undefined

    constructor(
        public grid: GridStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftListViewModel, any>(this, {
            grid: false,
            rpcStore: false,
            accountability: false,
            nftStore: false,
            logger: false,
        }, { autoBind: true })

        when(() => !!this.collection, async () => {
            await this.loadMore()
            await this.removePendingNfts()
        })
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    public async loadMore(): Promise<void> {
        if (!this.hasMore || this.loading) return

        this.loading = true

        try {
            const result = await this.rpcStore.rpc.getNftsByCollection({
                collection: this.collection.address,
                owner: this.accountability.selectedAccountAddress!,
                limit: LIMIT,
                continuation: this.continuation,
            })

            runInAction(() => {
                this.continuation = result.continuation
                this.hasMore = !!result.continuation
                this.nfts.push(...result.nfts)
            })
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public openNftDetails(nft: Nft): void {
        this.selectedNft = nft
    }

    public closeNftDetails(): void {
        this.selectedNft = undefined
    }

    public toggleDropdown(): void {
        this.dropdownActive = !this.dropdownActive
    }

    public hideDropdown(): void {
        this.dropdownActive = !this.dropdownActive
    }

    public async openCollectionInExplorer(): Promise<void> {
        const network = this.connectionGroup
        const { address } = this.collection

        await browser.tabs.create({
            url: accountExplorerLink({ network, address }),
            active: false,
        })
    }

    public async hideCollection(): Promise<void> {
        const owner = this.accountability.selectedAccountAddress!

        this.drawer.close()
        await this.nftStore.hideCollection(owner, this.collection.address)
    }

    public setExpanded(expanded: boolean): void {
        this.expanded = expanded
    }

    private async removePendingNfts(): Promise<void> {
        const owner = this.accountability.selectedAccountAddress!
        const pending = await this.rpcStore.rpc.removeAccountPendingNfts(owner, this.collection.address)

        if (pending) {
            runInAction(() => {
                this.pending = new Set<string>(pending.map(({ address }) => address))
            })
        }
    }

}
