import type * as nt from '@broxus/ever-wallet-wasm'
import { type NetworkConfig } from 'everscale-inpage-provider'

import FALLBACK_CONFIG_BETA from './extension_networks_config_beta.json'

const FALLBACK_CONFIG = FALLBACK_CONFIG_BETA

const enum NETWORK_GROUP {
    MAINNET_EVERSCALE = 'mainnet',
    MAINNET_VENOM = 'venom_mainnet',
    TESTNET_TYCHO = 'tycho_testnet',
    TON = 'ton_mainnet',
    TON_TESTNET = 'ton_testnet',
    HAMSTER = 'hmstr_mainnet',
    HUMO = 'humo_testnet',
}

export type NetworkGroup = NETWORK_GROUP | `custom${string}`
export type NetworkType = 'everscale' | 'tycho' | 'venom' | 'ton' | 'custom'

export type NetworkData = {
    id: string;
    workchainId: number;
    network: NetworkType;
    name: string;
    group: NetworkGroup;
    config: NetworkConfig;
    sortingOrder: number;
    isViewOnOnboarding: boolean;
} & ({ type: 'graphql'; endpoints: string[] } | { type: 'jrpc'; endpoint: string } | { type: 'proto'; endpoint: string })

export type PollingConfig = {
    tonWalletRefreshInterval: number;
    tokenWalletRefreshInterval: number;
    intensivePollingInterval: number;
}

export type Workchain = {
    id: number;
    networkType: NetworkType;
    networkGroup: NetworkGroup;
    config: NetworkConfig;
    icons: {
        nativeToken: string;
        network: string;
        vector: string;
    };
    walletDefaultAccountNames: Partial<Record<nt.ContractType, string>>;
    availableWalletTypes: { type: nt.ContractType; isDeprecated?: boolean }[];
    defaultActiveAssets?: {
        address: string;
    }[];
    defaultWalletType: nt.ContractType;
    nativeTokenAddress: string;
    seedPhraseWordsCount: [12, 24] | [12] | [24];
    currencyApiBaseUrl: string;
    tokenApiUrl?: {
        balances: string;
    };
    gaslessApiBaseUrl?: string;
    stakeInformation?: {
        stakingAPYLink: string;
        stakingVaultAddress: string;
        stakingRootContractAddress: string;
        stakeDepositAttachedFee: string;
        stakeRemovePendingWithdrawAttachedFee: string;
        stakeWithdrawAttachedFee: string;
    };
    nftInformation?: {
        marketplaceUrl?: string;
        defaultCollections?: string[];
    };
    pollingConfig?: {
        tonWalletRefreshInterval: number;
        tokenWalletRefreshInterval: number;
        intensivePollingInterval: number;
    };
}& ({ type: 'graphql'; endpoints: string[] } | { type: 'jrpc'; endpoint: string } | { type: 'proto'; endpoint: string })

export type BlockchainConfig = {
    id: string;
    networkName: string;
    workchains: Workchain[]
    defaultWorkchainId: number;
}

export type Blockchain = {
    workchainId: number;
    networkName: string;
    network: NetworkType;
    networkGroup: string;
    icons: {
        nativeToken: string;
        network: string;
        vector: string;
    };
    walletDefaultAccountNames: Partial<Record<nt.ContractType, string>>;
    availableWalletTypes: { type: nt.ContractType; isDeprecated?: boolean }[];
    defaultActiveAssets?: {
        address: string;
    }[];
    defaultWalletType: nt.ContractType;
    nativeTokenAddress: string;
    seedPhraseWordsCount: [12, 24] | [12] | [24];
    currencyApiBaseUrl: string;
    tokenApiUrl?: {
        balances: string;
    };
    gaslessApiBaseUrl?: string;
    stakeInformation?: {
        stakingAPYLink: string;
        stakingVaultAddress: string;
        stakingRootContractAddress: string;
        stakeDepositAttachedFee: string;
        stakeRemovePendingWithdrawAttachedFee: string;
        stakeWithdrawAttachedFee: string;
    };
    nftInformation?: {
        marketplaceUrl?: string;
        apiBaseUrl?: string;
        defaultCollections?: string[];
    };
    pollingConfig?: {
        tonWalletRefreshInterval: number;
        tokenWalletRefreshInterval: number;
        intensivePollingInterval: number;
    };
}

type StartConnectionsConfig = { connectionId: string }[]

export const fetchConfig = async (): Promise<ConnectionConfig> => {
    let config = new ConnectionConfig(FALLBACK_CONFIG as unknown as JsonConfig)
    // tag is useless while fetched config is not saved locally
    const headers = config.tag ? { 'If-None-Match': config.tag } : undefined

    try {
        const response = await fetch(`https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/extension_networks_config_${process.env.EXT_ENV || 'prod'}_v2.json`, { cache: 'no-store', headers })

        if (response.status !== 304) {
            const json = await response.json()
            const tag = response.headers.get('etag')

            config = new ConnectionConfig(json, tag ?? undefined)
        }
    }
    catch (error) {
        console.error(error, 'failed download config')
    }

    return config
}

type JsonConfig = {
    defaultConnectionId: string;
    defaultSettings: {
        walletDefaultAccountNames: Record<nt.ContractType, string>;
        separateDeployWalletTypes: nt.ContractType[];
        unsupportedByLedger: nt.ContractType[];
        startConnections: StartConnectionsConfig;
    };
    connections: BlockchainConfig[];
}

export class ConnectionConfig {

    readonly tag?: string

    readonly config: JsonConfig

    readonly defaultConnectionId: string


    readonly defaultBlockhainSettings: {
        walletDefaultAccountNames: Record<nt.ContractType, string>;
        separateDeployWalletTypes: nt.ContractType[];
        unsupportedByLedger: nt.ContractType[];
        startConnections: StartConnectionsConfig;
    }

    workchainIdByConnectionId: Record<string, number>

    networks: NetworkData[] = []

    networksMap: Record<string, NetworkData> = {}

    blockchainsByGroup: Record<string, Blockchain> = {}

    constructor(config: JsonConfig, tag?: string) {
        this.tag = tag
        this.config = config
        this.defaultConnectionId = config.defaultConnectionId
        this.workchainIdByConnectionId = config.connections.reduce((acc, item) => {
            acc[item.id] = item.defaultWorkchainId
            return acc
        }, {} as Record<string, number>)


        this.defaultBlockhainSettings = config.defaultSettings

        this.initialize()
    }

    initialize() {
        const blockchainsByGroup = this.config.connections.reduce((acc, item) => {
            item.workchains.forEach((workchain) => {
                acc[workchain.networkGroup] = {
                    ...workchain,
                    networkName: item.networkName,
                    network: workchain.networkType,
                    workchainId: workchain.id,
                }
            })
            return acc
        }, {} as Record<string, Blockchain>)

        blockchainsByGroup.custom = {
            ...CUSTOM_BLOCKCHAIN.workchains[0],
            networkName: CUSTOM_BLOCKCHAIN.networkName,
            workchainId: CUSTOM_BLOCKCHAIN.defaultWorkchainId,
            network: CUSTOM_BLOCKCHAIN.workchains[0].networkType,
        }

        this.networks = this.config.connections.map((connection) => {
            const workchain = connection.workchains.find(
                (item) => item.id === this.workchainIdByConnectionId[connection.id],
            )!
            return this.getNetwork(connection.id, workchain.id)
        })

        this.networksMap = this.networks.reduce((acc, item) => {
            acc[item.id] = item
            return acc
        }, {} as Record<string, NetworkData>)


        this.blockchainsByGroup = blockchainsByGroup
    }

    public updateWorkchainIdByConnectionId = (items: Record<string, number>) => {
        this.workchainIdByConnectionId = {
            ...this.workchainIdByConnectionId,
            ...items,
        }

        this.initialize()
    }

    public getNetwork = (connectionId: string, workchainId: number): NetworkData => {
        const connection = this.config.connections.find((item) => item.id === connectionId)

        if (!connection) {
            throw new Error(`Connection with id ${connectionId} not found`)
        }

        const workchain = connection?.workchains.find((item) => item.id === workchainId) ?? connection?.workchains[0]

        const isViewOnOnboarding = !!this.defaultBlockhainSettings.startConnections
            .find((item) => item.connectionId === connection.id)
        const sortingOrder = this.config.connections
            .findIndex((item) => item.id === connection.id) ?? Infinity

        return {
            workchainId: workchain.id,
            network: workchain.networkType,
            name: connection.networkName,
            group: workchain.networkGroup,
            sortingOrder,
            isViewOnOnboarding,
            ...workchain,
            id: connection.id,
        }
    }

}

export const createBlockchainsByGroupProxy = (blockchainsByGroup: Record<string,
    Blockchain>) => new Proxy(blockchainsByGroup, {
    get(target, prop: string) {
        if (prop in target) {
            return target[prop]
        }
        return target.custom
    },
})


export const CUSTOM_BLOCKCHAIN: BlockchainConfig = {
    id: 'custom',
    networkName: '',
    defaultWorkchainId: 0,
    workchains: [
        {
            id: 0,
            networkType: 'custom',
            networkGroup: 'custom',
            type: 'jrpc',
            endpoint: '',
            config: {},
            icons: {
                nativeToken: 'https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/icons/sparx/sparx.svg',
                network: 'https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/icons/sparx/sparx.svg',
                vector: 'https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/icons/sparx/sparx.svg',
            },
            availableWalletTypes: [
                {
                    type: 'EverWallet',
                },
                {
                    type: 'Multisig2_1',
                },
                {
                    type: 'WalletV5R1',
                },
            ],
            defaultWalletType: 'EverWallet',
            walletDefaultAccountNames: {
                EverWallet: 'Ever Wallet',
            },
            defaultActiveAssets: [],
            nativeTokenAddress: '',
            seedPhraseWordsCount: [
                12,
                24,
            ],
            currencyApiBaseUrl: '',
        },
    ],
}
