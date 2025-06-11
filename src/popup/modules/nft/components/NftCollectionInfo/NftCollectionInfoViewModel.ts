import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { Nft, NftCollection, NftType } from '@app/models'
import { AccountabilityStore, ConnectionStore, Logger, Router, RpcStore, SlidingPanelStore, Utils } from '@app/popup/modules/shared'

import { GridStore, NftStore } from '../../store'

const LIMIT = 8

@injectable()
export class NftCollectionInfoViewModel {

    public address!: string

    public nfts: string[] = []

    public nftById: Record<string, Nft> = {}

    public hasMore = true

    public pending: Set<string> | undefined

    private loading = false

    private continuation: string | undefined

    private type: NftType = 'nft'

    private reloading = false

    constructor(
        public grid: GridStore,
        public panel: SlidingPanelStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private router: Router,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.address = this.router.state.matches.at(-1)?.params?.address as string

        utils.when(() => !!this.collection, async () => {
            await this.removePendingNfts()
            await this.loadMore()
        })

        utils.register(
            rpcStore.addEventListener(async ({ type, data }) => {
                if (type === 'ntf-transfer') {
                    const isCurrent = data.some(
                        (transfer) => transfer.collection === this.collection?.address,
                    )

                    if (isCurrent) {
                        await this.reload()
                    }
                }

                if (type === 'ntf-token-transfer') {
                    const accountAddress = this.accountability.selectedAccountAddress
                    const current = data.filter((transfer) => {
                        if (transfer.collection === this.collection?.address) {
                            if (transfer.type === 'out' && transfer.sender === accountAddress) return true
                            if (transfer.type === 'in' && transfer.recipient === accountAddress) return true
                        }
                        return false
                    })

                    if (current.length !== 0) {
                        await this.reload()
                    }
                }
            }),
        )
    }

    public get collection(): NftCollection | undefined {
        return this.nftStore.collections[this.address]
    }

    public async loadMore(): Promise<void> {
        if (!this.hasMore || this.loading || !this.collection) return

        this.loading = true

        try {
            const result = await this.nftStore.getNftsByCollection({
                collection: this.collection.address,
                owner: this.accountability.selectedAccountAddress!,
                limit: LIMIT,
                continuation: this.continuation,
                type: this.type,
            })

            this.addNfts(result.nfts)

            runInAction(() => {
                this.loading = false
                this.continuation = result.continuation
                this.hasMore = !!result.continuation

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
                this.router.navigate(-1)
            }
        }
        catch (e) {
            this.logger.error(e)
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async openCollectionInExplorer(): Promise<void> {
        if (!this.collection) return

        const { address } = this.collection

        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(address),
            active: false,
        })
    }

    public async hideCollection(): Promise<void> {
        if (!this.collection || !this.accountability.selectedAccountAddress) return

        const owner = this.accountability.selectedAccountAddress

        await this.nftStore.hideCollection(owner, this.collection.address)
        this.router.navigate(-1)
    }

    private async removePendingNfts(): Promise<void> {
        if (!this.collection || !this.accountability.selectedAccountAddress) return

        const owner = this.accountability.selectedAccountAddress
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

    private addNfts(nfts: Nft[]): void {
        const ids = new Set<string>(
            nfts.map(({ id }) => id),
        )

        this.nfts = this.nfts.filter((id) => !ids.has(id))

        for (const nft of nfts) {
            this.nftById[nft.id] = nft
            this.nfts.push(nft.id)
        }
    }

}
