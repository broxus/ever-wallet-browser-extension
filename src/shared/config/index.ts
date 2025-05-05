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

export type Config = {
    defaultConnectionId: string;
    networks: NetworkData[];
    networksMap: Record<string, NetworkData>;
    defaultBlockhainSettings: {
        walletDefaultAccountNames: Record<nt.ContractType, string>;
        separateDeployWalletTypes: nt.ContractType[],
        unsupportedByLedger: nt.ContractType[],
    };
    blockchains: Blockchain[];
    blockchainsByNetwork: Record<string, Blockchain>;
    blockchainsByGroup: Record<string, Blockchain>;
};


export const loadConfig = async () => {
    const headers = CONFIG.value.tag ? { 'If-None-Match': CONFIG.value.tag } : undefined
    try {
        const response = await fetch(`https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/extension_networks_config_${process.env.EXT_ENV || 'prod'}.json`, { cache: 'no-store', headers })

        if (response.status === 304) return

        const config = await response.json()

        const tag = response.headers.get('etag')

        CONFIG.value = mapToConfig(config, tag || '')
    }
    catch (error) {
        console.error(error, 'failed download config')
    }
}


type JsonConfig = {
    tag: string;
    defaultConnectionId: string;
    networks: NetworkData[];
    networksMap: Record<string, NetworkData>;
    defaultBlockhainSettings: {
        walletDefaultAccountNames: Record<nt.ContractType, string>;
        separateDeployWalletTypes: nt.ContractType[],
        unsupportedByLedger: nt.ContractType[],
    };
    blockchains: Blockchain[];
}

const mapToConfig = (config:JsonConfig, tag?:string) => ({
    ...config,
    tag,
    networksMap: config.networks.reduce((acc, item) => {
        acc[item.id] = item
        return acc
    }, {} as Record<string, NetworkData>),
    blockchainsByNetwork: config.blockchains.reduce((acc, item) => {
        acc[item.network] = item
        return acc
    }, {} as Record<string, Blockchain>),
    blockchainsByGroup: config.blockchains.reduce((acc, item) => {
        acc[item.networkGroup] = item
        return acc
    }, {} as Record<string, Blockchain>),
})


export const CONFIG = new Proxy(
    { value: mapToConfig(FALLBACK_CONFIG as unknown as Omit<JsonConfig, 'blockchainsMap'>) },
    {
        set(target, prop, newValue) {
            if (prop !== 'value') return false

            target.value = newValue

            return true
        },
        get(target, prop) {
            if (prop === 'value') {
                return target.value
            }
            return undefined
        },
    },
)
