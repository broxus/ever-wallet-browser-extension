export const ENVIRONMENT_TYPE_POPUP = 'popup'
export const ENVIRONMENT_TYPE_NOTIFICATION = 'notification'
export const ENVIRONMENT_TYPE_FULLSCREEN = 'fullscreen'
export const ENVIRONMENT_TYPE_BACKGROUND = 'background'

export type Environment =
    | typeof ENVIRONMENT_TYPE_POPUP
    | typeof ENVIRONMENT_TYPE_NOTIFICATION
    | typeof ENVIRONMENT_TYPE_FULLSCREEN
    | typeof ENVIRONMENT_TYPE_BACKGROUND;

export const CONTENT_SCRIPT = 'nekoton-contentscript'
export const INPAGE_SCRIPT = 'nekoton-inpage'
export const NEKOTON_PROVIDER = 'nekoton-provider'
export const NEKOTON_CONTROLLER = 'nekoton-controller'
export const STANDALONE_CONTROLLER = 'standalone-controller'
export const STANDALONE_PROVIDER = 'standalone-provider'

export const NATIVE_CURRENCY = 'EVER'

export const TOKENS_MANIFEST_URL = 'https://raw.githubusercontent.com/broxus/ton-assets/master/manifest.json'
export const TOKENS_MANIFEST_REPO = 'https://github.com/broxus/ton-assets'

export const LEDGER_BRIDGE_URL = 'https://broxus.github.io/everscale-ledger-bridge'

export const DENS_ROOT_ADDRESS_CONFIG: Partial<Record<string, string>> = {
    mainnet: '0:a7d0694c025b61e1a4a846f1cf88980a5df8adf737d17ac58e35bf172c9fca29',
    testnet: '0:10086efad85fc0168d4090bc29bed834774d9603278e24e3bdbcf0ba3fdd9e45',
}
