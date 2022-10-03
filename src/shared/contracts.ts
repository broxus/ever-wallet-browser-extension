import type * as nt from '@wallet/nekoton-wasm'

import type en from '@app/lang/en'

export type ContractEntry = { type: nt.ContractType; description: keyof typeof en }

export const requiresSeparateDeploy = (contract?: nt.ContractType) =>
    contract !== 'WalletV3' && contract !== 'EverWallet' && contract !== 'HighloadWalletV2' // eslint-disable-line implicit-arrow-linebreak

export const CONTRACT_TYPE_NAMES: Record<nt.ContractType, string> = {
    EverWallet: 'EVER wallet',
    Multisig2: 'Multisig',
    WalletV3: 'WalletV3',
    SurfWallet: 'Surf wallet',
    SafeMultisigWallet: 'SafeMultisig',
    SafeMultisigWallet24h: 'SafeMultisig24h',
    SetcodeMultisigWallet: 'SetcodeMultisig',
    SetcodeMultisigWallet24h: 'SetcodeMultisig24h',
    BridgeMultisigWallet: 'BridgeMultisig',
    HighloadWalletV2: 'HighloadWalletV2',
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
]

export const DEFAULT_WALLET_TYPE: nt.ContractType = 'EverWallet'

export const DEFAULT_WALLET_CONTRACTS: ContractEntry[] = [
    {
        type: 'EverWallet',
        description: 'CONTRACT_DESCRIPTION_EVER_WALLET',
    },
    {
        type: 'Multisig2',
        description: 'CONTRACT_DESCRIPTION_MULTISIG2',
    },
]

export const OTHER_WALLET_CONTRACTS: ContractEntry[] = [
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
]

export const CONTRACT_TYPES_KEYS = [
    ...DEFAULT_WALLET_CONTRACTS.map(({ type }) => type),
    ...OTHER_WALLET_CONTRACTS.map(({ type }) => type),
]
