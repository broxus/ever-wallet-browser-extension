import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { GetNftsParams, GetNftsResult, Nft, NftCollection, PendingNft } from '@app/models'
import { ConnectionStore, Logger, RpcStore } from '@app/popup/modules/shared'
import { BROXUS_NFT_COLLECTIONS_LIST_URL, NetworkGroup } from '@app/shared'

@singleton()
export class NftStore {

    public collections: Record<string, NftCollection> = {}

    public nfts: Record<string, Nft> = {}

    public lastHiddenItem: HiddenItemInfo | undefined

    private _defaultNftCollections: string[] | undefined // mainnet default nft collections

    constructor(
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get marketplaceUrl(): string | undefined {
        const { blockchainsByGroup } = this.connectionStore.connectionConfig
        return blockchainsByGroup[this.connectionGroup]
            .nftInformation?.marketplaceUrl
    }

    public get accountNftCollections(): Record<string, NftCollection[]> {
        const accountNftCollections = this.rpcStore.state.accountNftCollections[this.connectionGroup] ?? {}
        return Object.entries(accountNftCollections).reduce((result, [owner, collections]) => {
            result[owner] = Object.values(collections)
            return result
        }, {} as Record<string, NftCollection[]>)
    }

    public get accountPendingNfts(): Record<string, Record<string, PendingNft[]>> {
        return this.rpcStore.state.accountPendingNfts[this.connectionGroup] ?? {}
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    private get defaultNftCollections(): string[] {
        if (!this._defaultNftCollections) {
            const { blockchainsByGroup } = this.connectionStore.connectionConfig
            this._defaultNftCollections = blockchainsByGroup[this.connectionGroup]
                .nftInformation?.defaultCollections || []
        }

        return this._defaultNftCollections
    }

    public async scanNftCollections(owner: string): Promise<void> {
        const addresses = await this.getCollectionsToScan(owner)
        const collections = await this.rpcStore.rpc.scanNftCollections(owner, addresses)

        await this.rpcStore.rpc.updateAccountNftCollections(owner, collections)

        runInAction(() => {
            for (const collection of collections) {
                this.collections[collection.address] = collection
            }
        })
    }

    public async getNftsByCollection(params: GetNftsParams): Promise<GetNftsResult> {
        const result = await this.rpcStore.rpc.getNftsByCollection(params)

        runInAction(() => {
            for (const nft of result.nfts) {
                this.nfts[nft.address] = nft
            }
        })

        return result
    }

    public async getNft(owner: string, address: string): Promise<Nft | null> {
        const nft = await this.rpcStore.rpc.getNfts(owner, address)

        if (nft) {
            runInAction(() => {
                this.nfts[nft.address] = nft
            })
        }

        return nft
    }

    public async getNftCollections(addresses: string[]): Promise<NftCollection[]> {
        const collections = await this.rpcStore.rpc.getNftCollections(addresses)

        runInAction(() => {
            for (const collection of collections) {
                this.collections[collection.address] = collection
            }
        })

        return collections
    }

    public async importNftCollection(owner: string, address: string): Promise<NftCollection> {
        const collection = await this.rpcStore.rpc.searchNftCollectionByAddress(owner, address)
        const collections = await this.importNftCollections(owner, [collection.address])

        if (!collections?.[0]) throw new Error()

        return collections?.[0]
    }

    public async importNftCollections(owner: string, addresses: string[]): Promise<NftCollection[] | null> {
        try {
            const collections = this.accountNftCollections[owner]
            const scanCollections = await this.rpcStore.rpc.scanNftCollections(owner, addresses)

            if (scanCollections.length === 0) return null

            const current = new Set(collections.map(({ address }) => address))
            const newCollections = scanCollections.filter(({ address }) => !current.has(address))
            const visibility = scanCollections.reduce((result, { address }) => {
                result[address] = true
                return result
            }, {} as Record<string, boolean>)

            if (newCollections.length) {
                await this.rpcStore.rpc.updateAccountNftCollections(owner, [...collections, ...newCollections])
            }
            await this.rpcStore.rpc.updateNftCollectionVisibility(owner, visibility)

            runInAction(() => {
                for (const collection of scanCollections) {
                    this.collections[collection.address] = collection
                }
            })

            return scanCollections
        }
        catch (e: any) {
            this.logger.error(e)
            return null
        }
    }

    public async hideCollection(owner: string, collection: string): Promise<void> {
        this.lastHiddenItem = {
            owner,
            collection,
        }

        await this.rpcStore.rpc.updateNftCollectionVisibility(owner, {
            [collection]: false,
        })
    }

    public async undoHideCollection(): Promise<void> {
        if (!this.lastHiddenItem) return

        const { owner, collection } = this.lastHiddenItem
        await this.rpcStore.rpc.updateNftCollectionVisibility(owner, {
            [collection]: true,
        })

        runInAction(() => {
            this.lastHiddenItem = undefined
        })
    }

    public async resetHiddenItem(): Promise<void> {
        this.lastHiddenItem = undefined
    }

    private async getCollectionsToScan(owner: string): Promise<string[]> {
        let defaultCollections: string[] = []

        if (this.connectionGroup === 'mainnet') {
            defaultCollections = await this.defaultNftCollections
        }

        const collections = this.accountNftCollections[owner] ?? []
        const pending = Object.keys(this.accountPendingNfts[owner] ?? {})
        const addrSet = new Set([
            ...defaultCollections,
            ...pending,
            ...collections.map(({ address }) => address),
        ])

        return [...addrSet]
    }

    private async fetchDefaultNftCollections(): Promise<string[]> {
        const storedCollections = this.loadDefaultNftCollections()
        if (storedCollections) {
            return storedCollections
        }

        try {
            const response = await fetch(BROXUS_NFT_COLLECTIONS_LIST_URL)
            const list: NftCollectionsList = await response.json()
            const collections = list.items.map(({ address }) => address)

            this.saveDefaultNftCollections(collections)

            return collections
        }
        catch (e) {
            this.logger.error(e)
        }

        return []
    }

    private loadDefaultNftCollections(): string[] | null {
        try {
            const value = localStorage.getItem(STORAGE_KEY)
            const data: StoredData = JSON.parse(value ?? '{}')
            const { collections, lastFetched } = data

            if (!lastFetched || !collections || !Array.isArray(collections) || !Number.isInteger(lastFetched)) {
                return null
            }

            if (Date.now() - lastFetched >= REFRESH_INTERVAL || collections.length === 0) {
                return null
            }

            return collections
        }
        catch (e) {
            this.logger.error(e)
        }

        return null
    }

    private saveDefaultNftCollections(collections: string[]): void {
        try {
            const data: StoredData = {
                lastFetched: Date.now(),
                collections,
            }
            const value = JSON.stringify(data)
            localStorage.setItem(STORAGE_KEY, value)
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}

const STORAGE_KEY = 'wallet:default-nft-collections'

const REFRESH_INTERVAL = 60 * 60 * 1000 // 1 hour

interface StoredData {
    lastFetched: number;
    collections: string[];
}

interface NftCollectionsList {
    items: Array<{
        address: string,
    }>;
}

interface HiddenItemInfo {
    owner: string;
    collection: string;
}
