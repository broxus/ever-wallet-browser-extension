import type { ContractType } from '@wallet/nekoton-wasm';

export const CONTRACT_TYPES: { [K in ContractType]: string } = {
  SafeMultisigWallet: 'SafeMultisig (default)',
  SafeMultisigWallet24h: 'SafeMultisig24',
  BridgeMultisigWallet: 'BridgeMultisigWallet',
  SurfWallet: 'Surf',
  WalletV3: 'WalletV3',
  SetcodeMultisigWallet: 'SetcodeMultisigWallet',
};

export const CONTRACT_TYPES_KEYS = Object.keys(CONTRACT_TYPES) as ContractType[];
