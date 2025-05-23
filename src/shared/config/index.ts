import type * as nt from '@broxus/ever-wallet-wasm'
import { NetworkConfig } from 'everscale-inpage-provider'

import FALLBACK_CONFIG_PROD from './extension_networks_config_prod.json'
import FALLBACK_CONFIG_BETA from './extension_networks_config_beta.json'

const FALLBACK_CONFIG = process.env.EXT_ENV === 'beta' ? FALLBACK_CONFIG_BETA : FALLBACK_CONFIG_PROD

const enum NETWORK_GROUP {
    MAINNET_EVERSCALE = 'mainnet',
    MAINNET_VENOM = 'venom_mainnet',
    TESTNET_TYCHO = 'tycho_testnet',
    TON = 'ton_mainnet',
    HAMSTER = 'hmstr_mainnet',
    HUMO = 'humo_testnet',
}

export type NetworkGroup = NETWORK_GROUP | `custom${string}`
export type NetworkType = 'everscale' | 'tycho' | 'venom' | 'ton' | 'hamster' | 'custom'

export type NetworkData = {
    id: string;
    network: NetworkType;
    name: string;
    group: NetworkGroup;
    config: NetworkConfig
    sortingOrder: number;
    isViewOnOnboarding: boolean;
} & ({ type: 'graphql'; endpoints: string[] } | { type: 'jrpc'; endpoint: string } | { type: 'proto'; endpoint: string });

export type Blockchain = {
    networkName: string;
    network: NetworkType;
    networkGroup: string;
    icons: {
        nativeToken: string;
        network: string;
        vector: string;
    };
    walletDefaultAccountNames: Partial<Record<nt.ContractType, string>>;
    availableWalletTypes: { type: nt.ContractType, isDeprecated?: boolean }[];
    defaultActiveAssets?: {
        address: string;
    }[];
    defaultWalletType: nt.ContractType;
    nativeTokenAddress: string;
    seedPhraseWordsCount: [12, 24] | [12] | [24];
    currencyApiBaseUrl: string;
    tokenApiUrl?: {
        balances: string
    };
    stakeInformation?: {
        decimals: number;
        symbol: string;
        stakingAPYLink: string;
        stakingVaultAddress: string;
        stakingRootContractAddress: string;
        stakeDepositAttachedFee: string;
        stakeRemovePendingWithdrawAttachedFee: string;
        stakeWithdrawAttachedFee: string;
    },
};


export const fetchConfig = async (): Promise<ConnectionConfig> => {
    let config = new ConnectionConfig(FALLBACK_CONFIG as unknown as JsonConfig)
    // tag is useless while fetched config is not saved locally
    const headers = config.tag ? { 'If-None-Match': config.tag } : undefined

    try {
        const response = await fetch(`https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/extension_networks_config_${process.env.EXT_ENV || 'prod'}.json`, { cache: 'no-store', headers })

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
    networks: NetworkData[];
    defaultBlockhainSettings: {
        walletDefaultAccountNames: Record<nt.ContractType, string>;
        separateDeployWalletTypes: nt.ContractType[],
        unsupportedByLedger: nt.ContractType[],
    };
    blockchains: Blockchain[];
}

export class ConnectionConfig {

    readonly tag?: string

    readonly defaultConnectionId: string

    readonly networks: NetworkData[]

    readonly defaultBlockhainSettings: {
        walletDefaultAccountNames: Record<nt.ContractType, string>;
        separateDeployWalletTypes: nt.ContractType[],
        unsupportedByLedger: nt.ContractType[],
    }

    readonly blockchains: Blockchain[]

    readonly networksMap: Record<string, NetworkData>

    readonly blockchainsByNetwork: Record<NetworkType, Blockchain>

    readonly blockchainsByGroup: Record<string, Blockchain>

    constructor(config: JsonConfig, tag?: string) {
        this.tag = tag
        this.defaultConnectionId = config.defaultConnectionId
        this.networks = config.networks
        this.defaultBlockhainSettings = config.defaultBlockhainSettings
        this.blockchains = config.blockchains

        this.networksMap = config.networks.reduce((acc, item) => {
            acc[item.id] = item
            return acc
        }, {} as Record<string, NetworkData>)

        this.blockchainsByNetwork = config.blockchains.reduce((acc, item) => {
            acc[item.network] = item
            return acc
        }, {} as Record<string, Blockchain>)

        this.blockchainsByGroup = config.blockchains.reduce((acc, item) => {
            acc[item.networkGroup] = item
            return acc
        }, {} as Record<string, Blockchain>)
    }

}
