import type * as nt from '@broxus/ever-wallet-wasm'
import { Address } from 'everscale-inpage-provider'
import cloneDeep from 'lodash.clonedeep'
import log from 'loglevel'

import { getNftImage, getNftPreview, NekotonRpcError, NetworkGroup, RpcErrorCode } from '@app/shared'
import type {
    BaseNftJson,
    GetNftsParams,
    GetNftsResult,
    Nekoton,
    Nft,
    NftCollection,
    NftTransfer,
    NftTransferToPrepare,
    RpcEvent,
} from '@app/models'
import { NftTokenTransfer, NftTokenTransferToPrepare, PendingNft } from '@app/models'
import {
    IMultiTokenTransferAbi,
    IndexAbi,
    INftTransferAbi,
    MultiTokenCollectionAbi,
    MultiTokenWalletAbi,
    NftAbi,
    MultiTokenNftAbi,
    NftTIP422Abi,
    CollectionTIP422Abi,
    NftCollectionAbi,
} from '@app/abi'

import { Deserializers, Storage } from '../utils/Storage'
import { ContractFactory } from '../utils/Contract'
import { BaseConfig, BaseController, BaseState } from './BaseController'
import { ConnectionController } from './ConnectionController'
import { AccountController, ITransactionsListener } from './AccountController/AccountController'

interface NftControllerConfig extends BaseConfig {
    nekoton: Nekoton;
    connectionController: ConnectionController;
    accountController: AccountController;
    storage: Storage<NftStorage>;
    contractFactory: ContractFactory;
    sendEvent?: (event: RpcEvent) => void;
}

interface NftControllerState extends BaseState {
    accountNftCollections: Record<NetworkGroup, {
        [owner: string]: { [collection: string]: NftCollection }
    }>
    accountPendingNfts: Record<NetworkGroup, {
        [owner: string]: { [collection: string]: PendingNft[] }
    }>;
    nftCollectionsVisibility: { [owner: string]: { [address: string]: boolean | undefined } };
}

const defaultState: NftControllerState = {
    accountNftCollections: {} as NftControllerState['accountNftCollections'],
    accountPendingNfts: {} as NftControllerState['accountPendingNfts'],
    nftCollectionsVisibility: {},
}

export class NftController extends BaseController<NftControllerConfig, NftControllerState> {

    constructor(
        config: NftControllerConfig,
        state?: NftControllerState,
    ) {
        super(config, state || cloneDeep(defaultState))

        this.initialize()
        this._subscribeForTransactions()
    }

    public initialSync(): void {
        const { storage } = this.config
        const accountNftCollections = storage.snapshot.accountNftCollections ?? {} as NftControllerState['accountNftCollections']
        const nftCollectionsVisibility = storage.snapshot.nftCollectionsVisibility ?? {}
        const accountPendingNfts = storage.snapshot.accountPendingNfts ?? {} as NftControllerState['accountPendingNfts']

        this.update({
            accountNftCollections,
            nftCollectionsVisibility,
            accountPendingNfts,
        })
    }

    public async clear() {
        await this.config.storage.remove([
            'accountNftCollections',
            'nftCollectionsVisibility',
            'accountPendingNfts',
        ])
    }

    public async updateNftCollectionVisibility(
        owner: string,
        params: Record<string, boolean>,
    ): Promise<void> {
        const { nftCollectionsVisibility } = this.state

        this.update({
            nftCollectionsVisibility: {
                ...nftCollectionsVisibility,
                [owner]: {
                    ...nftCollectionsVisibility[owner],
                    ...params,
                },
            },
        })

        await this._saveNftCollectionsVisibility()
    }

    public async scanNftCollections(owner: string, addresses: string[]): Promise<NftCollection[]> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            const collections = await Promise.all(addresses.map(async (address) => {
                const contractState = await requireContractState(address, transport)
                const collection = await this._getCollection(address, contractState)

                const [list, multiList] = await Promise.all([
                    this._getNftIndexes({
                        type: 'nft',
                        collection: collection.address,
                        limit: 1,
                        owner,
                    }),
                    this._getNftIndexes({
                        type: 'fungible',
                        collection: collection.address,
                        limit: 1,
                        owner,
                    }),
                ])

                if (list.accounts.length === 0 && multiList.accounts.length === 0) return null

                return collection
            }))

            return collections.filter((value): value is NftCollection => !!value)
        })
    }

    public async getNftCollections(addresses: string[]): Promise<NftCollection[]> {
        return this.config.connectionController.use(async ({ data: { transport }}) => Promise.all(
            addresses.map(async (address) => {
                const contractState = await requireContractState(address, transport)
                return this._getCollection(address, contractState)
            }),
        ))
    }

    public async getNftsByCollection(params: GetNftsParams): Promise<GetNftsResult> {
        const { connectionController, contractFactory } = this.config

        return connectionController.use(async ({ data: { transport }}) => {
            const nfts: Nft[] = []
            const list = await this._getNftIndexes(params)
            const collectionContractState = await requireContractState(params.collection, transport)
            const result = await Promise.allSettled(
                list.accounts.map(async (account) => {
                    const index = contractFactory.create(IndexAbi, account)
                    const { nft: address } = await index.call('getInfo', { answerId: 0 }, { responsible: true })
                    const contractState = await requireContractState(address, transport)

                    if (params.type === 'nft') {
                        return this._getNft(address, contractState, collectionContractState)
                    }

                    const multitokenWallet = contractFactory.create(MultiTokenWalletAbi, address)
                    const [
                        { id },
                        { value: balance },
                    ] = await Promise.all([
                        multitokenWallet.call('getInfo', { answerId: 0 }, { contractState, responsible: true }),
                        multitokenWallet.call('balance', { answerId: 0 }, { contractState, responsible: true }),
                    ])
                    const nftAddress = await getNftAddress(id)

                    const nft = await this._getNft(
                        nftAddress,
                        await requireContractState(nftAddress, transport),
                        collectionContractState,
                    )
                    nft.balance = balance

                    return nft
                }),
            )

            for (const item of result) {
                if (item.status === 'fulfilled') {
                    nfts.push(item.value)
                }
                else {
                    log.warn(item.reason)
                }
            }

            return {
                nfts,
                continuation: list.continuation,
                type: params.type,
            }

            async function getNftAddress(id: string): Promise<Address> {
                const collection = contractFactory.create(MultiTokenCollectionAbi, params.collection)
                const { nft } = await collection.call('nftAddress', { answerId: 0, id }, {
                    contractState: collectionContractState,
                    responsible: true,
                })

                return nft
            }
        })
    }

    public async getNft(owner: string, address: string): Promise<Nft | null> {
        const { connectionController, contractFactory } = this.config
        const contractState = await connectionController.use(
            async ({ data: { transport }}) => transport.getFullContractState(address),
        )

        if (!contractState) return null

        const nft = await this._getNft(address, contractState)

        if (nft.supply) {
            try {
                const multitokenCollection = contractFactory.create(MultiTokenCollectionAbi, nft.collection)
                const { token } = await multitokenCollection.call('multiTokenWalletAddress', {
                    answerId: 0,
                    id: nft.id,
                    owner: new Address(owner),
                }, { responsible: true })
                const multitokenWallet = contractFactory.create(MultiTokenWalletAbi, token)
                const { value } = await multitokenWallet.call('balance', { answerId: 0 }, { responsible: true })

                nft.balance = value
            }
            catch {}
        }

        return nft
    }

    public async prepareNftTransfer(
        address: string,
        params: NftTransferToPrepare,
    ): Promise<nt.InternalMessage> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            let nft: nt.Nft | undefined
            try {
                nft = await transport.subscribeToNft(address, noopHandler)
                const message = await nft.prepareTransfer(params.recipient, params.sendGasTo, params.callbacks)

                return {
                    ...message,
                    amount: '3000000000',
                }
            }
            finally {
                nft?.free()
            }
        })
    }

    public async prepareNftTokenTransfer(
        owner: string,
        nft: { id: string, collection: string },
        params: NftTokenTransferToPrepare,
    ): Promise<nt.InternalMessage> {
        const { nekoton, contractFactory } = this.config
        const body = nekoton.encodeInternalInput(
            MultiTokenWalletWithRoyaltyABI,
            'transfer',
            {
                ...params,
                deployTokenWalletValue: '1000000000',
                notify: true,
                payload: nekoton.packIntoCell(TRANSFER_PAYLOAD, nft).boc,
            },
        )

        const collection = contractFactory.create(MultiTokenCollectionAbi, nft.collection)
        const { token } = await collection.call('multiTokenWalletAddress', {
            answerId: 0,
            owner: new Address(owner),
            id: nft.id,
        }, { responsible: true })

        return {
            body,
            destination: token.toString(),
            amount: '2000000000',
            bounce: true,
        }
    }

    public async updateAccountNftCollections(owner: string, collections: NftCollection[]): Promise<void> {
        const { group } = this.config.connectionController.state.selectedConnection
        const { accountNftCollections } = this.state

        this.update({
            accountNftCollections: {
                ...accountNftCollections,
                [group]: {
                    ...accountNftCollections[group],
                    [owner]: collections.reduce((result, collection) => {
                        result[collection.address] = collection
                        return result
                    }, {} as Record<string, NftCollection>),
                },
            },
        })

        await this._saveAccountNftCollections()
    }

    public async searchNftCollectionByAddress(owner:string, address: string): Promise<NftCollection> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            let nft: Nft | null = null

            try {
                nft = await this.getNft(owner, address)
            }
            catch {}

            if (nft && nft.owner !== owner && (!nft.balance || nft.balance === '0')) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, 'Not nft owner')
            }

            const _address = nft?.collection ?? address
            const contractState = await requireContractState(_address, transport)
            return this._getCollection(_address, contractState)
        })
    }

    public async removeAccountPendingNfts(owner: string, collection: string): Promise<PendingNft[] | undefined> {
        const { group } = this.config.connectionController.state.selectedConnection
        const updatedValue: NftControllerState['accountPendingNfts'] = {
            ...this.state.accountPendingNfts,
            [group]: {
                ...this.state.accountPendingNfts[group],
                [owner]: {
                    ...this.state.accountPendingNfts[group]?.[owner],
                },
            },
        }
        const removed = updatedValue[group]?.[owner]?.[collection]

        if (removed) {
            delete updatedValue[group]?.[owner]?.[collection]

            this.update({
                accountPendingNfts: updatedValue,
            })

            await this._saveAccountPendingNfts()
        }

        return removed
    }

    private _updateNftTransfers(address: string, transactions: nt.TonWalletTransaction[]) {
        const { connectionController, sendEvent, nekoton } = this.config
        const { group } = connectionController.state.selectedConnection
        const { accountPendingNfts } = this.state
        const pending = accountPendingNfts[group]?.[address] ?? {}
        const transferred: NftTransfer[] = []
        let update = false

        // reverse order from oldest to newest
        for (let i = transactions.length - 1; i >= 0; i--) {
            const transaction = transactions[i]

            try {
                const decoded = nekoton.decodeTransaction(transaction, INftTransferABI, 'onNftTransfer')

                if (!decoded || !transaction.inMessage.src) continue

                const oldOwner = decoded.input.oldOwner as string
                const newOwner = decoded.input.newOwner as string
                const id = decoded.input.id as string
                const collection = decoded.input.collection as string
                // const nft = transaction.inMessage.src

                if (newOwner === address) {
                    // nft in transfer
                    update = true

                    if (!pending[collection]) {
                        pending[collection] = []
                    }

                    pending[collection].push({
                        id,
                        collection,
                    })
                }
                else if (oldOwner === address) {
                    if (pending[collection]) {
                        pending[collection] = pending[collection].filter(
                            // remove from pending if it was already transferred
                            (transfer) => transfer.id !== id,
                        )
                    }

                    transferred.push({
                        id,
                        collection,
                        oldOwner,
                        newOwner,
                    })
                }
            }
            catch {}
        }

        if (update) {
            this.update({
                accountPendingNfts: {
                    ...accountPendingNfts,
                    [group]: {
                        ...accountPendingNfts[group],
                        [address]: pending,
                    },
                },
            })

            this._saveAccountPendingNfts().catch(log.error)
        }

        if (transferred.length) {
            sendEvent?.({
                type: 'ntf-transfer',
                data: transferred,
            })
        }
    }

    private _updateNftTokenTransfers(address: string, transactions: nt.TonWalletTransaction[]) {
        const { connectionController, sendEvent, nekoton } = this.config
        const { group } = connectionController.state.selectedConnection
        const { accountPendingNfts } = this.state
        const pending = accountPendingNfts[group]?.[address] ?? {}
        const transferred: NftTokenTransfer[] = []
        let update = false

        // reverse order from oldest to newest
        for (let i = transactions.length - 1; i >= 0; i--) {
            const transaction = transactions[i]

            try {
                const message = transaction.outMessages.at(0)
                const sender = message?.src

                if (message?.body) {
                    const decoded = nekoton.decodeInput(message?.body, MultiTokenWalletWithRoyaltyABI, 'transfer', true)

                    if (
                        sender
                        && typeof decoded?.input?.payload === 'string'
                        && typeof decoded?.input?.recipient === 'string'
                    ) {
                        const { payload, recipient } = decoded.input
                        const { id, collection } = nekoton.unpackFromCell(TRANSFER_PAYLOAD, payload, true)
                        if (typeof id === 'string' && typeof collection === 'string') {
                            transferred.push({
                                type: 'out',
                                id,
                                collection,
                                sender,
                                recipient,
                            })
                            continue
                        }
                    }
                }
            }
            catch {}


            try {
                const decoded = nekoton.decodeTransaction(transaction, IMultiTokenTransferABI, 'onMultiTokenTransfer')

                if (!decoded || !transaction.inMessage.dst) continue

                const collection = decoded.input.collection as string
                const id = decoded.input.tokenId as string // nft id
                const sender = decoded.input.sender as string
                const recipient = transaction.inMessage.dst

                update = true

                if (!pending[collection]) {
                    pending[collection] = []
                }

                pending[collection].push({ id, collection })
                transferred.push({
                    type: 'in',
                    id,
                    collection,
                    sender,
                    recipient,
                })
            }
            catch {}
        }

        if (update) {
            this.update({
                accountPendingNfts: {
                    ...accountPendingNfts,
                    [group]: {
                        ...accountPendingNfts[group],
                        [address]: pending,
                    },
                },
            })

            this._saveAccountPendingNfts().catch(log.error)
        }

        if (transferred.length) {
            sendEvent?.({
                type: 'ntf-token-transfer',
                data: transferred,
            })
        }
    }

    private _subscribeForTransactions() {
        const listener: ITransactionsListener = {
            onEverTransactionsFound: (
                address: string,
                _walletDetails: nt.TonWalletDetails,
                transactions: nt.TonWalletTransaction[],
                info: nt.TransactionsBatchInfo,
            ) => {
                if (info.batchType === 'new') {
                    this._updateNftTransfers(address, transactions)
                    this._updateNftTokenTransfers(address, transactions)
                }
            },
        }

        this.config.accountController.addTransactionsListener(listener)
    }

    private async _getMultitokenSupply(
        address: Address | string,
        contractState?: nt.FullContractState,
    ): Promise<string | undefined> {
        try {
            const { count } = await this.config.contractFactory
                .create(MultiTokenNftAbi, address)
                .call('multiTokenSupply', { answerId: 0 }, { contractState, responsible: true })
            return count
        }
        catch {}

        return undefined
    }

    private async _getNftMetadataJson(params: {
        nftAddress: Address | string,
        collectionAddress: Address | string,
        nftContractState?: nt.FullContractState,
        collectionContractState?: nt.FullContractState,
    }): Promise<string | undefined> {
        try {
            const { nftAddress, collectionAddress, nftContractState, collectionContractState } = params
            const nft = this.config.contractFactory.create(NftTIP422Abi, nftAddress)
            const { part: parts } = await nft.call(
                'getUrlParts',
                { answerId: 0 },
                { contractState: nftContractState, responsible: true },
            )

            const collection = this.config.contractFactory.create(CollectionTIP422Abi, collectionAddress)
            const { nftUrl } = await collection.call(
                'getNftUrl',
                { answerId: 0, parts },
                { contractState: collectionContractState, responsible: true },
            )

            const response = await fetch(nftUrl, { cache: 'force-cache' })
            return await response.text()
        }
        catch {}

        return undefined
    }

    private async _getCollectionMetadataJson(
        address: Address | string,
        contractState?: nt.FullContractState,
    ): Promise<string | undefined> {
        try {
            const collection = this.config.contractFactory.create(CollectionTIP422Abi, address)
            const { collectionUrl } = await collection.call(
                'getCollectionUrl',
                { answerId: 0 },
                { contractState, responsible: true },
            )

            const response = await fetch(collectionUrl, { cache: 'force-cache' })
            return await response.text()
        }
        catch {}

        return undefined
    }

    private _getNftIndexes({ type, collection, owner, limit, continuation }: GetNftsParams): Promise<nt.AccountsList> {
        const { nekoton, connectionController } = this.config
        const tokens = {
            collection,
            owner,
            stamp: btoa(type),
        }
        const abiParams = type === 'nft' ? NFT_SALT_PARAMS : FUNGIBLE_SALT_PARAMS
        const { boc } = nekoton.packIntoCell(abiParams, tokens, '2.0') // !!! abi version 2.0
        const { hash } = nekoton.setCodeSalt(INDEX_CODE, boc)

        return connectionController.use(
            ({ data: { transport }}) => transport.getAccountsByCodeHash(hash, limit, continuation),
        )
    }

    private async _getNft(
        address: Address | string,
        contractState: nt.FullContractState,
        collectionContractState?: nt.FullContractState,
    ): Promise<Nft> {
        const { contractFactory } = this.config
        const contract = contractFactory.create(NftAbi, address)
        const params = { contractState, responsible: true }
        let json: BaseNftJson

        const [
            info,
            { value0: isTIP422 },
            supply,
            // metadataUrl,
        ] = await Promise.all([
            contract.call('getInfo', { answerId: 0 }, params),
            // https://github.com/Lisska/docs/blob/main/src/standard/TIP-4/2_2.md#tip4_2_2nft
            contract.call('supportsInterface', { answerId: 0, interfaceID: 0x7239d7b1 }, params),
            this._getMultitokenSupply(address, contractState),
        ])

        if (isTIP422) {
            const rawJson = await this._getNftMetadataJson({
                nftAddress: address,
                collectionAddress: info.collection,
                nftContractState: contractState,
                collectionContractState,
            })
            json = parseJson(rawJson)
        }
        else {
            const { json: rawJson } = await contract.call('getJson', { answerId: 0 }, params)
            json = parseJson(rawJson)
        }

        return {
            supply,
            id: info.id,
            address: address.toString(),
            collection: info.collection.toString(),
            owner: info.owner.toString(),
            manager: info.manager.toString(),
            name: json.name ?? 'Empty name',
            description: json.description ?? '',
            preview: getNftPreview(json),
            img: getNftImage(json),
        }
    }

    private async _getCollection(
        address: Address | string,
        contractState: nt.FullContractState,
    ): Promise<NftCollection> {
        const { contractFactory } = this.config
        const contract = contractFactory.create(NftCollectionAbi, address)
        const params = { contractState, responsible: true }
        let json: BaseNftJson

        // https://github.com/Lisska/docs/blob/main/src/standard/TIP-4/2_2.md#tip4_2_2collection
        const { value0: isTIP422 } = await contract.call('supportsInterface', { answerId: 0, interfaceID: 0x244a5200 }, params)

        if (isTIP422) {
            const rawJson = await this._getCollectionMetadataJson(address, contractState)
            json = parseJson(rawJson)
        }
        else {
            const { json: rawJson } = await contract.call('getJson', { answerId: 0 }, params)
            json = parseJson(rawJson)
        }

        return {
            address: address.toString(),
            name: json.name ?? 'Empty name',
            description: json.description ?? '',
            preview: getNftPreview(json),
        }
    }

    private _saveAccountNftCollections(): Promise<void> {
        return this.config.storage.set({
            accountNftCollections: this.state.accountNftCollections,
        })
    }

    private _saveNftCollectionsVisibility(): Promise<void> {
        return this.config.storage.set({
            nftCollectionsVisibility: this.state.nftCollectionsVisibility,
        })
    }

    private _saveAccountPendingNfts(): Promise<void> {
        return this.config.storage.set({
            accountPendingNfts: this.state.accountPendingNfts,
        })
    }

}

function parseJson(json: string | undefined | null): BaseNftJson {
    try {
        return JSON.parse(json ?? '{}') as BaseNftJson
    }
    catch {
        return {}
    }
}

async function requireContractState(address: Address | string, transport: nt.Transport): Promise<nt.FullContractState> {
    const contractState = await transport.getFullContractState(address.toString())
    if (!contractState) throw new Error(`Account not found: ${address}`)
    return contractState
}

const noopHandler: nt.NftSubscriptionHandler = {
    onManagerChanged() {},
    onMessageExpired() {},
    onMessageSent() {},
    onOwnerChanged() {},
}

const INftTransferABI = JSON.stringify(INftTransferAbi)
const IMultiTokenTransferABI = JSON.stringify(IMultiTokenTransferAbi)
const MultiTokenWalletWithRoyaltyABI = JSON.stringify(MultiTokenWalletAbi)

const INDEX_CODE = 'te6ccgECHQEAA1UAAgaK2zUcAQQkiu1TIOMDIMD/4wIgwP7jAvILGQMCGwOK7UTQ10nDAfhmifhpIds80wABn4ECANcYIPkBWPhC+RDyqN7TPwH4QyG58rQg+COBA+iogggbd0CgufK0+GPTHwHbPPI8DgsEA3rtRNDXScMB+GYi0NMD+kAw+GmpOAD4RH9vcYIImJaAb3Jtb3Nwb3T4ZNwhxwDjAiHXDR/yvCHjAwHbPPI8GBgEAzogggujrde64wIgghAWX5bBuuMCIIIQR1ZU3LrjAhMPBQRCMPhCbuMA+EbycyGT1NHQ3vpA0fhBiMjPjits1szOyds8CxwIBgJqiCFus/LoZiBu8n/Q1PpA+kAwbBL4SfhKxwXy4GT4ACH4a/hs+kJvE9cL/5Mg+GvfMNs88gAHFAA8U2FsdCBkb2Vzbid0IGNvbnRhaW4gYW55IHZhbHVlAhjQIIs4rbNYxwWKiuIJCgEK103Q2zwKAELXTNCLL0pA1yb0BDHTCTGLL0oY1yYg10rCAZLXTZIwbeICFu1E0NdJwgGOgOMNDBcCSnDtRND0BXEhgED0Do6A34kg+Gz4a/hqgED0DvK91wv/+GJw+GMNDgECiQ4AQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAD/jD4RvLgTPhCbuMA0x/4RFhvdfhk0ds8I44mJdDTAfpAMDHIz4cgznHPC2FeIMjPkll+WwbOWcjOAcjOzc3NyXCOOvhEIG8TIW8S+ElVAm8RyM+EgMoAz4RAzgH6AvQAcc8LaV4gyPhEbxXPCx/OWcjOAcjOzc3NyfhEbxTi+wAXEhABCOMA8gARACjtRNDT/9M/MfhDWMjL/8s/zsntVAAi+ERwb3KAQG90+GT4S/hM+EoDNjD4RvLgTPhCbuMAIZPU0dDe+kDR2zww2zzyABcVFAA6+Ez4S/hK+EP4QsjL/8s/z4POWcjOAcjOzc3J7VQBMoj4SfhKxwXy6GXIz4UIzoBvz0DJgQCg+wAWACZNZXRob2QgZm9yIE5GVCBvbmx5AELtRNDT/9M/0wAx+kDU0dD6QNTR0PpA0fhs+Gv4avhj+GIACvhG8uBMAgr0pCD0oRsaABRzb2wgMC41OC4yAAAADCD4Ye0e2Q=='
const FUNGIBLE_SALT_PARAMS = [
    { name: 'collection', type: 'address' },
    { name: 'owner', type: 'address' },
    { name: 'stamp', type: 'fixedbytes8' },
] as nt.AbiParam[]
const NFT_SALT_PARAMS = [
    { name: 'collection', type: 'address' },
    { name: 'owner', type: 'address' },
    { name: 'stamp', type: 'fixedbytes3' },
] as nt.AbiParam[]
const TRANSFER_PAYLOAD = [
    { name: 'id', type: 'string' },
    { name: 'collection', type: 'address' },
] as nt.AbiParam[]

interface NftStorage {
    accountNftCollections: NftControllerState['accountNftCollections'];
    nftCollectionsVisibility: NftControllerState['nftCollectionsVisibility'];
    accountPendingNfts: NftControllerState['accountPendingNfts'];
}

Storage.register<NftStorage>({
    accountNftCollections: { deserialize: Deserializers.object },
    nftCollectionsVisibility: { deserialize: Deserializers.object },
    accountPendingNfts: { deserialize: Deserializers.object },
})
