import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { Nft, NftCollection } from '@app/models'
import { AccountabilityStore, ConnectionStore, Drawer, Logger, RpcStore, Utils } from '@app/popup/modules/shared'

import { GridStore, NftStore } from '../../store'

const LIMIT = 8

@injectable()
export class NftListViewModel {

    public collection!: NftCollection

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
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.autorun(async () => {
            const transferred = this.nftStore.transferredNfts
            const isCurrent = transferred.some((nft) => nft.collection === this.collection.address)

            if (isCurrent) {
                await this.reload()

                if (this.selectedNft) {
                    const { address } = this.selectedNft
                    const isSelectedNft = transferred.some((nft) => nft.address === address)

                    if (isSelectedNft) {
                        this.closeNftDetails()
                    }
                }
            }
        })

        utils.when(() => !!this.collection, async () => {
            await this.loadMore()
            await this.removePendingNfts()
        })
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

            if (this.nfts.length === 0) {
                this.closeNftDetails()
                this.drawer.close()
            }
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
        const { address } = this.collection

        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(address),
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

    private async reload(): Promise<void> {
        await when(() => !this.loading)

        runInAction(() => {
            this.nfts = []
            this.continuation = undefined
            this.hasMore = true
        })

        await this.loadMore()
    }

}
