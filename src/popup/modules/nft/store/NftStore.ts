import { action, autorun, computed, makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import type { Nft, NftTransfer } from '@app/models'
import { NetworkGroup, NftCollection } from '@app/models'
import { RpcStore } from '@app/popup/modules/shared'
import { BROXUS_NFT_COLLECTIONS_LIST_URL, Logger } from '@app/shared'

@singleton()
export class NftStore {

    public collections: Record<string, NftCollection> = {}

    public nfts: Record<string, Nft> = {}

    public lastHiddenItem: HiddenItemInfo | undefined

    private _defaultNftCollections: Promise<string[]> | undefined // mainnet default nft collections

    constructor(
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftStore, any>(this, {
            rpcStore: false,
            logger: false,
            transferredNfts: computed.struct,
        }, { autoBind: true })

        // TODO: implement worker events
        autorun(async () => {
            if (!this.transferredNfts.length) return
            await this.rpcStore.rpc.removeTransferredNfts()
        })
    }

    public get accountNftCollections(): Record<string, NftCollection[]> {
        const accountNftCollections = this.rpcStore.state.accountNftCollections[this.connectionGroup] ?? {}
        return Object.entries(accountNftCollections).reduce((result, [owner, collections]) => {
            result[owner] = Object.values(collections)
            return result
        }, {} as Record<string, NftCollection[]>)
    }

    public get accountPendingNfts(): Record<string, Record<string, NftTransfer[]>> {
        return this.rpcStore.state.accountPendingNfts[this.connectionGroup] ?? {}
    }

    public get transferredNfts(): NftTransfer[] {
        return this.rpcStore.state.transferredNfts
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    private get defaultNftCollections(): Promise<string[]> {
        if (!this._defaultNftCollections) {
            this._defaultNftCollections = this.fetchDefaultNftCollections()
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

    public async getNfts(addresses: string[]): Promise<Nft[]> {
        const nfts = await this.rpcStore.rpc.getNfts(addresses)

        runInAction(() => {
            for (const nft of nfts) {
                this.nfts[nft.address] = nft
            }
        })

        return nfts
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

    public async importNftCollection(owner:string, address: string): Promise<NftCollection> {
        const collection = await this.rpcStore.rpc.searchNftCollectionByAddress(owner, address)
        const collections = await this.importNftCollections(owner, [collection.address])

        if (!collections?.[0]) throw new Error()

        return collections?.[0]
    }

    public async importNftCollections(owner:string, addresses: string[]): Promise<NftCollection[] | null> {
        const scanCollections = await this.rpcStore.rpc.scanNftCollections(owner, addresses)

        if (scanCollections.length === 0) return null

        const collections = this.accountNftCollections[owner]
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

    public async hideCollection(owner: string, collection: string): Promise<void> {
        clearTimeout(this.lastHiddenItem?.timeoutId)

        this.lastHiddenItem = {
            owner,
            collection,
            timeoutId: setTimeout(action(() => {
                this.lastHiddenItem = undefined
            }), UNDO_TIMEOUT),
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

const UNDO_TIMEOUT = 3 * 1000 // 3 sec

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
    timeoutId: any;
}
