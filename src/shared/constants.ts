import type { ContractType } from 'nekoton-wasm';

export const ENVIRONMENT_TYPE_POPUP = 'popup';
export const ENVIRONMENT_TYPE_NOTIFICATION = 'notification';
export const ENVIRONMENT_TYPE_FULLSCREEN = 'fullscreen';
export const ENVIRONMENT_TYPE_BACKGROUND = 'background';

export type Environment =
  | typeof ENVIRONMENT_TYPE_POPUP
  | typeof ENVIRONMENT_TYPE_NOTIFICATION
  | typeof ENVIRONMENT_TYPE_FULLSCREEN
  | typeof ENVIRONMENT_TYPE_BACKGROUND;

export const CONTENT_SCRIPT = 'nekoton-contentscript';
export const INPAGE_SCRIPT = 'nekoton-inpage';
export const NEKOTON_PROVIDER = 'nekoton-provider';

export const NATIVE_CURRENCY = 'EVER';

export const TOKENS_MANIFEST_URL = 'https://raw.githubusercontent.com/broxus/ton-assets/master/manifest.json';
export const TOKENS_MANIFEST_REPO = 'https://github.com/broxus/ton-assets';

export const DEFAULT_CONTRACT_TYPE: ContractType = 'SafeMultisigWallet';

export const LEDGER_BRIDGE_URL = 'https://broxus.github.io/everscale-ledger-bridge';
