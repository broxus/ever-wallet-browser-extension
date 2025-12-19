import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import log from 'loglevel'

import { GetNftsParams, GetNftsResult, Nft, NftCollection, PendingNft } from '@app/models'
import { ConnectionStore, Logger, RpcStore } from '@app/popup/modules/shared'
import { NetworkGroup } from '@app/shared'
import { NftApi, Configuration, NFT, CollectionApi } from '@app/api/nft'

@singleton()
export class NftStore {

    public collections: Record<string, NftCollection> = {}

    public nfts: Record<string, Nft> = {}

    public lastHiddenItem: HiddenItemInfo | undefined

    constructor(
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get api() {
        if (!this.apiBaseUrl) return null

        const config = new Configuration({
            basePath: this.apiBaseUrl,
        })

        return {
            nft: new NftApi(config),
            collection: new CollectionApi(config),
        }
    }

    public get marketplaceUrl(): string | undefined {
        const { blockchainsByGroup } = this.connectionStore.connectionConfig
        return blockchainsByGroup[this.connectionGroup]
            ?.nftInformation?.marketplaceUrl
    }

    public get apiBaseUrl(): string | undefined {
        const { blockchainsByGroup } = this.connectionStore.connectionConfig
        return blockchainsByGroup[this.connectionGroup]
            ?.nftInformation?.apiBaseUrl
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
        const { blockchainsByGroup } = this.connectionStore.connectionConfig
        return blockchainsByGroup[this.connectionGroup]
            ?.nftInformation?.defaultCollections || []
    }

    public async scanNftCollections(owner: string): Promise<void> {
        const addresses = await this.getCollectionsToScan(owner)
        let collections: NftCollection[] = []
        if (this.api) {
            collections = await this.getCollectionsV2(owner, addresses)
        }
        else {
            collections = await this.rpcStore.rpc.scanNftCollections(owner, addresses)
        }

        await this.rpcStore.rpc.updateAccountNftCollections(owner, collections)

        runInAction(() => {
            for (const collection of collections) {
                this.collections[collection.address] = collection
            }
        })
    }

    public async getNftsByCollection(params: GetNftsParams): Promise<GetNftsResult> {
        const nfts: Nft[] = []
        let result
        if (this.apiBaseUrl) {
            result = await this.getNftsV2(params)
        }
        else {
            result = await this.rpcStore.rpc.getNftsByCollection(params)
        }


        runInAction(() => {
            for (const nft of nfts) {
                this.nfts[nft.address] = nft
            }
        })

        return result
    }

    public async getNft(owner: string, address: string): Promise<Nft | null> {
        let nft: Nft | null


        if (this.apiBaseUrl) {
            nft = await this.getNftV2(address)
        }
        else {
            nft = await this.rpcStore.rpc.getNfts(owner, address)
        }

        if (nft) {
            runInAction(() => {
                this.nfts[nft!.address] = nft!
            })
        }

        return nft
    }


    public async getCollectionsV2(
        owner: string,
        addresses: string[],
    ): Promise<NftCollection[]> {
        if (!this.api) return [] as NftCollection[]

        try {
            const response = await this.api.nft.getNftList({
                nFTListQuery: {
                    owners: [owner],
                    collections: addresses,
                    verified: false,
                },
            })

            return Object.values(response.collection ?? {}).map((collection) => ({
                address: collection.address,
                name: collection.name || 'Empty Name',
                description: collection.description ?? '',
                preview: collection.logo ?? collection.wallpaper ?? '',
            }))
        }
        catch (e) {
            log.error('getNfts', e)
            return []
        }
    }

    public async getNftsV2({ owner, limit, collection, continuation = '0' }: GetNftsParams):
     Promise<GetNftsResult> {
        const data = {
            nfts: [],
            continuation,
            type: 'nft',
        } as GetNftsResult

        if (!this.api) return data

        try {
            const response = await this.api.nft.getNftList({
                nFTListQuery: {
                    limit,
                    offset: continuation ? Number(continuation) : undefined,
                    owners: [owner],
                    collections: [collection],
                    verified: false,
                },
            })
            data.nfts = response.items.map((item) => ({
                id: item.address,
                address: item.address,
                collection: item.collection,
                owner: item.owner,
                name: item.name ?? 'Empty name',
                manager: item.manager,
                description: item?.description,
                preview: item?.image,
                img: item?.image,
            }) as Nft)

            const count = (data.nfts.length + parseInt(continuation, 10))

            data.continuation = response.totalCount > count
                ? count.toString()
                : undefined
        }
        catch (e) {
            log.error('getNfts', e)
        }


        return data
    }

    public async getNftV2(address: string): Promise<Nft | null> {
        let data: NFT | undefined

        try {
            const response = await this.api?.nft?.getNft({
                nFTParam: {
                    nft: address,
                },
            })
            data = response?.nft
        }
        catch (e) {
            log.error('getNfts', e)
        }


        return data ? {
            id: data.address,
            address: data.address,
            collection: data.collection,
            manager: data.manager,
            owner: data.owner,
            name: data.name ?? 'Empty name',
            description: data?.description,
            preview: data?.image,
            img: data?.image,
        } as Nft : null
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


    public async searchNftCollectionByAddressV2(owner: string, address: string): Promise<NftCollection> {
        const collection = await this.getCollectionsV2(owner, [address])

        return collection[0]
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

            let scanCollections: NftCollection[] = []
            if (this.api) {
                scanCollections = await this.getCollectionsV2(owner, addresses)
            }
            else {
                scanCollections = await this.rpcStore.rpc.scanNftCollections(owner, addresses)
            }


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
        const defaultCollections: string[] = this.defaultNftCollections

        const collections = this.accountNftCollections[owner] ?? []
        const pending = Object.keys(this.accountPendingNfts[owner] ?? {})
        const addrSet = new Set([
            ...defaultCollections,
            ...pending,
            ...collections.map(({ address }) => address),
        ])

        return [...addrSet]
    }

}
interface HiddenItemInfo {
    owner: string;
    collection: string;
}
