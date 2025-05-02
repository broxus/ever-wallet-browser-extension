/* eslint-disable implicit-arrow-linebreak */
import type * as nt from '@broxus/ever-wallet-wasm'

import { Config, CONFIG, NetworkType } from './config'

export type ContractEntry = { type: nt.ContractType; description: string }

export const requiresSeparateDeploy = (contract?: nt.ContractType, config:Config = CONFIG.value) => (contract
    ? config.defaultBlockhainSettings.separateDeployWalletTypes.includes(contract) : true)

export const supportedByLedger = (contract?: nt.ContractType, config:Config = CONFIG.value) =>
    (contract ? !config.defaultBlockhainSettings.unsupportedByLedger.includes(contract) : true)

export const getContractName = (
    contractType: nt.ContractType,
    type: NetworkType,
    config:Config,
): string =>
    config.blockchainsByNetwork[type]?.walletDefaultAccountNames?.[contractType]
    ?? config.defaultBlockhainSettings.walletDefaultAccountNames[contractType]


export const getContractTypes = (config:Config) =>
    Object.keys(config.defaultBlockhainSettings.walletDefaultAccountNames) as nt.ContractType[]

export const getDefaultContractType = (type: NetworkType, config:Config): nt.ContractType =>
    config.blockchainsByNetwork[type].defaultWalletType


export const getDefaultWalletContracts = (type: NetworkType, config:Config): ContractEntry[] =>
    config.blockchainsByNetwork[type].availableWalletTypes.filter(item =>
        !item.isDeprecated).map(({ type }) => ({ type, description: WALLET_CONTRACTS_DESCRIPTION[type] }))

export const getOtherWalletContracts = (type: NetworkType, config:Config): ContractEntry[] =>
    config.blockchainsByNetwork[type].availableWalletTypes.filter(item =>
        item.isDeprecated).map(({ type }) => ({ type, description: WALLET_CONTRACTS_DESCRIPTION[type] }))

export const getWalletContracts = (type: NetworkType, config:Config): ContractEntry[] =>
    config.blockchainsByNetwork[type].availableWalletTypes.map((item) =>
        ({ type: item.type, description: WALLET_CONTRACTS_DESCRIPTION[item.type] }))


const WALLET_CONTRACTS_DESCRIPTION: Record<nt.ContractType, string> = {
    EverWallet: 'CONTRACT_DESCRIPTION_EVER_WALLET',
    Multisig2_1: 'CONTRACT_DESCRIPTION_MULTISIG2',
    WalletV5R1: 'CONTRACT_DESCRIPTION_WALLET_V5R1',
    WalletV4R1: 'CONTRACT_DESCRIPTION_WALLET_V4R1',
    WalletV4R2: 'CONTRACT_DESCRIPTION_WALLET_V4R2',
    WalletV3R1: 'CONTRACT_DESCRIPTION_WALLET_V3R1',
    WalletV3R2: 'CONTRACT_DESCRIPTION_WALLET_V3R2',
    SurfWallet: 'CONTRACT_DESCRIPTION_SURF_WALLET',
    WalletV3: 'CONTRACT_DESCRIPTION_WALLET_V3',
    SafeMultisigWallet: 'CONTRACT_DESCRIPTION_SAFE_MULTISIG',
    SafeMultisigWallet24h: 'CONTRACT_DESCRIPTION_SAFE_MULTISIG_24H',
    SetcodeMultisigWallet: 'CONTRACT_DESCRIPTION_SETCODE_MULTISIG',
    SetcodeMultisigWallet24h: 'CONTRACT_DESCRIPTION_SETCODE_MULTISIG_24H',
    BridgeMultisigWallet: 'CONTRACT_DESCRIPTION_BRIDGE_MULTISIG',
    HighloadWalletV2: 'CONTRACT_DESCRIPTION_HIGHLOAD_WALLET_V2',
    Multisig2: 'CONTRACT_DESCRIPTION_MULTISIG2',
}
