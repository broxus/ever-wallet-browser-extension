import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { Nft, NftCollection, NftType } from '@app/models'
import { AccountabilityStore, ConnectionStore, Drawer, Logger, RpcStore, Utils } from '@app/popup/modules/shared'

import { GridStore, NftStore } from '../../store'

const LIMIT = 8

@injectable()
export class NftListViewModel {

    public collection!: NftCollection

    public nfts: Nft[] = []

    public selectedNft: Nft | undefined

    public hasMore = true

    public expanded: boolean | undefined

    public pending: Set<string> | undefined

    private loading = false

    private continuation: string | undefined

    private type: NftType = 'nft'

    private reloading = false

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

        utils.when(() => !!this.collection, async () => {
            await this.removePendingNfts()
            await this.loadMore()
        })

        utils.register(
            rpcStore.addEventListener(async ({ type, data }) => {
                if (type === 'ntf-transfer') {
                    const isCurrent = data.some(
                        (transfer) => transfer.collection === this.collection.address,
                    )

                    if (isCurrent) {
                        if (this.selectedNft) {
                            const { id, collection } = this.selectedNft
                            const isSelectedNft = data.some(
                                (transfer) => transfer.id === id && transfer.collection === collection,
                            )

                            if (isSelectedNft) {
                                this.closeNftDetails()
                            }
                        }

                        await this.reload()
                    }
                }

                if (type === 'ntf-token-transfer') {
                    const accountAddress = this.accountability.selectedAccountAddress
                    const current = data.filter((transfer) => {
                        if (transfer.collection === this.collection.address) {
                            if (transfer.type === 'out' && transfer.sender === accountAddress) return true
                            if (transfer.type === 'in' && transfer.recipient === accountAddress) return true
                        }
                        return false
                    })

                    if (current.length !== 0) {
                        if (this.selectedNft) {
                            const { id, collection } = this.selectedNft
                            const isSelectedNft = current.some(
                                (transfer) => transfer.id === id && transfer.collection === collection,
                            )

                            if (isSelectedNft) {
                                this.closeNftDetails()
                            }
                        }

                        await this.reload()
                    }
                }
            }),
        )
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
                type: this.type,
            })

            runInAction(() => {
                this.loading = false
                this.continuation = result.continuation
                this.hasMore = !!result.continuation
                this.nfts.push(...result.nfts)

                if (this.type === 'nft' && !this.hasMore) {
                    this.type = 'fungible'
                    this.continuation = undefined
                    this.hasMore = true

                    if (result.nfts.length < LIMIT) {
                        this.loadMore()
                    }
                }
            })

            if (this.nfts.length === 0 && !this.hasMore) {
                this.closeNftDetails()
                this.drawer.close()
            }
        }
        catch (e) {
            this.logger.error(e)
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
                this.pending = new Set<string>(pending.map(({ id }) => id))
            })
        }
    }

    private async reload(): Promise<void> {
        if (this.reloading) return

        try {
            this.reloading = true

            await when(() => !this.loading)

            runInAction(() => {
                this.nfts = []
                this.type = 'nft'
                this.continuation = undefined
                this.hasMore = true
            })

            await this.loadMore()
        }
        finally {
            this.reloading = false
        }
    }

}
