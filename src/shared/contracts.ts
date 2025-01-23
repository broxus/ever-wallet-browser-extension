/* eslint-disable implicit-arrow-linebreak */
import type * as nt from '@broxus/ever-wallet-wasm'

import { NetworkType } from '@app/models'

export type ContractEntry = { type: nt.ContractType; description: string }

export const requiresSeparateDeploy = (contract?: nt.ContractType) => {
    switch (contract) {
        case 'WalletV3':
        case 'WalletV4R1':
        case 'WalletV4R2':
        case 'WalletV5R1':
        case 'EverWallet':
        case 'HighloadWalletV2':
            return false
        default:
            return true
    }
}

export const supportedByLedger = (contract?: nt.ContractType) =>
    contract !== 'SetcodeMultisigWallet24h' && contract !== 'HighloadWalletV2'

export const getContractName = (contractType: nt.ContractType, type: NetworkType): string => {
    const contractTypeNames: Record<nt.ContractType, string> = {
        EverWallet: 'Default',
        Multisig2: 'Legacy Multi-sig',
        Multisig2_1: 'Multisig',
        WalletV3: 'WalletV3',
        WalletV4R1: 'WalletV4R1',
        WalletV4R2: 'WalletV4R2',
        WalletV5R1: 'WalletV5R1',
        SurfWallet: 'Surf wallet',
        SafeMultisigWallet: 'SafeMultisig',
        SafeMultisigWallet24h: 'SafeMultisig24h',
        SetcodeMultisigWallet: 'SetcodeMultisig',
        SetcodeMultisigWallet24h: 'SetcodeMultisig24h',
        BridgeMultisigWallet: 'BridgeMultisig',
        HighloadWalletV2: 'HighloadWalletV2',
    }

    if (type === 'everscale') {
        contractTypeNames.EverWallet = 'EVER Wallet'
    }

    if (type === 'venom' || type === 'ton') {
        contractTypeNames.WalletV3 = 'Legacy'
    }

    return contractTypeNames[contractType]
}

export const ACCOUNTS_TO_SEARCH: nt.ContractType[] = [
    'WalletV3',
    'SurfWallet',
    'SafeMultisigWallet',
    'SafeMultisigWallet24h',
    'SetcodeMultisigWallet',
    'SetcodeMultisigWallet24h',
    'BridgeMultisigWallet',
    'EverWallet',
    'Multisig2',
    'Multisig2_1',
    'WalletV4R1',
    'WalletV4R2',
    'WalletV5R1',
]

export const getDefaultContractType = (type: NetworkType): nt.ContractType => {
    switch (type) {
        case 'ton':
            return 'WalletV5R1'
        default:
            return 'EverWallet'
    }
}

const tonContracts = new Set<nt.ContractType>([
    'EverWallet',
    'Multisig2_1',
    'WalletV5R1',
    'WalletV4R1',
    'WalletV4R2',
])

const defaultContracts = new Set<nt.ContractType>([
    'EverWallet',
    'Multisig2_1',
    'SurfWallet',
    'WalletV3',
    'SafeMultisigWallet',
    'SafeMultisigWallet24h',
    'SetcodeMultisigWallet',
    'SetcodeMultisigWallet24h',
    'BridgeMultisigWallet',
    'HighloadWalletV2',
    'Multisig2',
])

export const getDefaultWalletContracts = (type: NetworkType): ContractEntry[] => {
    switch (type) {
        case 'ton':
            return DEFAULT_WALLET_CONTRACTS.filter(({ type }) => tonContracts.has(type))
        default:
            return DEFAULT_WALLET_CONTRACTS.filter(({ type }) => defaultContracts.has(type))
    }
}

export const getOtherWalletContracts = (type: NetworkType): ContractEntry[] => {
    switch (type) {
        case 'ton':
            return OTHER_WALLET_CONTRACTS.filter(({ type }) => tonContracts.has(type))
        default:
            return OTHER_WALLET_CONTRACTS.filter(({ type }) => defaultContracts.has(type))
    }
}

export const getWalletContracts = (type: NetworkType): ContractEntry[] => {
    switch (type) {
        case 'ton':
            return WALLET_CONTRACTS.filter(({ type }) => tonContracts.has(type))
        default:
            return WALLET_CONTRACTS.filter(({ type }) => defaultContracts.has(type))
    }
}

const DEFAULT_WALLET_CONTRACTS: ContractEntry[] = [
    {
        type: 'EverWallet',
        description: 'CONTRACT_DESCRIPTION_EVER_WALLET',
    },
    {
        type: 'Multisig2_1',
        description: 'CONTRACT_DESCRIPTION_MULTISIG2',
    },
    {
        type: 'WalletV5R1',
        description: 'CONTRACT_DESCRIPTION_WALLET_V5R1',
    },
]

const OTHER_WALLET_CONTRACTS: ContractEntry[] = [
    {
        type: 'WalletV4R1',
        description: 'CONTRACT_DESCRIPTION_WALLET_V4R1',
    },
    {
        type: 'WalletV4R2',
        description: 'CONTRACT_DESCRIPTION_WALLET_V4R2',
    },
    {
        type: 'SurfWallet',
        description: 'CONTRACT_DESCRIPTION_SURF_WALLET',
    },
    {
        type: 'WalletV3',
        description: 'CONTRACT_DESCRIPTION_WALLET_V3',
    },
    {
        type: 'SafeMultisigWallet',
        description: 'CONTRACT_DESCRIPTION_SAFE_MULTISIG',
    },
    {
        type: 'SafeMultisigWallet24h',
        description: 'CONTRACT_DESCRIPTION_SAFE_MULTISIG_24H',
    },
    {
        type: 'SetcodeMultisigWallet',
        description: 'CONTRACT_DESCRIPTION_SETCODE_MULTISIG',
    },
    {
        type: 'SetcodeMultisigWallet24h',
        description: 'CONTRACT_DESCRIPTION_SETCODE_MULTISIG_24H',
    },
    {
        type: 'BridgeMultisigWallet',
        description: 'CONTRACT_DESCRIPTION_BRIDGE_MULTISIG',
    },
    {
        type: 'HighloadWalletV2',
        description: 'CONTRACT_DESCRIPTION_HIGHLOAD_WALLET_V2',
    },
    {
        type: 'Multisig2',
        description: 'CONTRACT_DESCRIPTION_MULTISIG2',
    },
]

const WALLET_CONTRACTS = [
    ...DEFAULT_WALLET_CONTRACTS,
    ...OTHER_WALLET_CONTRACTS,
]
