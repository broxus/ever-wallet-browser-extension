import type { ContractType } from '@wallet/nekoton-wasm'

export const CONTRACT_TYPES: { [K in ContractType]: string } = {
    SafeMultisigWallet: 'SafeMultisig (default)',
    SafeMultisigWallet24h: 'SafeMultisig24',
    BridgeMultisigWallet: 'BridgeMultisigWallet',
    SurfWallet: 'Surf',
    WalletV3: 'WalletV3',
    SetcodeMultisigWallet: 'SetcodeMultisigWallet',
}

export const CONTRACT_TYPE_NAMES: { [K in ContractType]: string } = {
    ...CONTRACT_TYPES,
    SafeMultisigWallet: 'SafeMultisig',
}

export const CONTRACT_TYPES_KEYS = Object.keys(CONTRACT_TYPES) as ContractType[]

export const LOCALES = [
    { name: 'en', title: 'English' },
    { name: 'ko', title: '한국어' },
    { name: 'ja', title: '日本語' },
] as const
