import type { ContractType } from '@wallet/nekoton-wasm'

export const CONTRACT_TYPES: Record<ContractType, string> = {
    SafeMultisigWallet: 'SafeMultisig (default)',
    SafeMultisigWallet24h: 'SafeMultisig24',
    BridgeMultisigWallet: 'BridgeMultisigWallet',
    SurfWallet: 'Surf',
    WalletV3: 'WalletV3',
    SetcodeMultisigWallet: 'SetcodeMultisigWallet',
    SetcodeMultisigWallet24h: 'SetcodeMultisigWallet24',
}

export const CONTRACT_TYPE_NAMES: Record<ContractType, string> = {
    ...CONTRACT_TYPES,
    SafeMultisigWallet: 'SafeMultisig',
}

export const CONTRACT_TYPES_KEYS = Object.keys(CONTRACT_TYPES) as ContractType[]

export const LOCALES = [
    { name: 'en', title: 'English' },
    { name: 'ko', title: '한국어' },
    { name: 'ja', title: '日本語' },
    { name: 'id', title: 'Bahasa Indonesia' },
] as const
