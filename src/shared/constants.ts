import { NetworkGroup } from './config'

export const ENVIRONMENT_TYPE_POPUP = 'popup'
export const ENVIRONMENT_TYPE_NOTIFICATION = 'notification'
export const ENVIRONMENT_TYPE_FULLSCREEN = 'fullscreen'
export const ENVIRONMENT_TYPE_BACKGROUND = 'background'
export const ENVIRONMENT_TYPE_PHISHING_WARNING = 'phishing-warning'

export type Environment =
    | typeof ENVIRONMENT_TYPE_POPUP
    | typeof ENVIRONMENT_TYPE_NOTIFICATION
    | typeof ENVIRONMENT_TYPE_FULLSCREEN
    | typeof ENVIRONMENT_TYPE_BACKGROUND
    | typeof ENVIRONMENT_TYPE_PHISHING_WARNING;

export const CONTENT_SCRIPT = 'sparx-nekoton-contentscript'
export const INPAGE_SCRIPT = 'sparx-nekoton-inpage'
export const NEKOTON_PROVIDER = 'sparx-nekoton-provider'
export const NEKOTON_CONTROLLER = 'sparx-nekoton-controller'
export const STANDALONE_CONTROLLER = 'sparx-standalone-controller'
export const STANDALONE_PROVIDER = 'sparx-standalone-provider'
export const PHISHING_SAFELIST = 'sparx-phishing-safelist'
export const PHISHING = 'sparx-phishing'

export const NATIVE_CURRENCY_FALLBACK = 'EVER'

export const MULTISIG_UNCONFIRMED_LIMIT = 5

export const LEDGER_BRIDGE_URL = 'https://broxus.github.io/everscale-ledger-bridge'

export const BUY_EVER_URL = 'https://buy.everwallet.net/'

export const MS_INFO_URL = 'https://docs.everwallet.net/multisig/creating-a-multisig-account'

export const BROXUS_BLOCKLIST_URL = 'https://raw.githubusercontent.com/broxus/ever-wallet-anti-phishing/master/blacklist.json'

export const BROXUS_NFT_COLLECTIONS_LIST_URL = 'https://raw.githubusercontent.com/broxus/nft-lists/master/ever-wallet-default.json'

export const WALLET_TERMS_URL = 'https://sparxwallet.com/terms'

export const NFT_MARKETPLACE_URL = 'https://tokstock.io'

export const BROXUS_SUPPORT_LINK = 'https://t.me/broxus_chat'

export const TON_TOKEN_API_BASE_URL = 'https://ton-tokens-api.broxus.com/token'

export const DENS_ROOT_ADDRESS_CONFIG: Partial<Record<NetworkGroup, string>> = {
    mainnet: '0:a7d0694c025b61e1a4a846f1cf88980a5df8adf737d17ac58e35bf172c9fca29',
    // testnet: '0:10086efad85fc0168d4090bc29bed834774d9603278e24e3bdbcf0ba3fdd9e45',
}

export const EVERNAME_ADDRESS = '0:a7d0694c025b61e1a4a846f1cf88980a5df8adf737d17ac58e35bf172c9fca29'

export const PWD_MIN_LENGTH = process.env.NODE_ENV === 'production' ? 8 : 1

export const SOCIAL_URLS = {
    telegram: 'https://t.me/sparx_wallet',
    github: 'https://github.com/broxus/sparx-wallet-browser-extension',
    broxus: 'https://broxus.com/',
    twitter: 'https://x.com/broxus',
    linkedin: 'https://www.linkedin.com/company/broxus/',
}
