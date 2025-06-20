import type { NetworkGroup, StakingConfig } from '@app/models'

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

export const CONTENT_SCRIPT = 'nekoton-contentscript'
export const INPAGE_SCRIPT = 'nekoton-inpage'
export const NEKOTON_PROVIDER = 'nekoton-provider'
export const NEKOTON_CONTROLLER = 'nekoton-controller'
export const STANDALONE_CONTROLLER = 'standalone-controller'
export const STANDALONE_PROVIDER = 'standalone-provider'
export const PHISHING_SAFELIST = 'phishing-safelist'
export const PHISHING = 'phishing'

export const NATIVE_CURRENCY = 'EVER'
export const NATIVE_CURRENCY_DECIMALS = 9

export const MULTISIG_UNCONFIRMED_LIMIT = 5

export const TOKENS_MANIFEST_URL = 'https://raw.githubusercontent.com/broxus/ton-assets/master/manifest.json'
export const TOKENS_MANIFEST_REPO = 'https://github.com/broxus/ton-assets'

export const LEDGER_BRIDGE_URL = 'https://broxus.github.io/everscale-ledger-bridge'

export const BUY_EVER_URL = 'https://buy.everwallet.net/'

export const ST_EVER_DECIMALS = 9
export const STAKE_APY_PERCENT = '12'
export const STAKE_TUTORIAL_URL = '#' // TODO

export const BROXUS_BLOCKLIST_URL = 'https://raw.githubusercontent.com/broxus/ever-wallet-anti-phishing/master/blacklist.json'

export const BROXUS_NFT_COLLECTIONS_LIST_URL = 'https://raw.githubusercontent.com/broxus/nft-lists/master/ever-wallet-default.json'

export const FLATQUBE_API_BASE_PATH = 'https://api.flatqube.io/v1'

export const WALLET_TERMS_URL = 'https://l1.broxus.com/everscale/wallet/terms'

export const NFT_MARKETPLACE_URL = 'https://tokstock.io/nft'

export const BROXUS_SUPPORT_LINK = 'https://t.me/broxus_chat'

export const TON_TOKEN_API_BASE_URL = 'https://ton-tokens-api.broxus.com/token'

export const JETTON_GQL_ENDPOINT = 'https://dton.io/graphql/graphql'

export const STAKING_CONFIG: Record<NetworkGroup, StakingConfig> = {
    mainnet: {
        vaultAddress: '0:675a6d63f27e3f24d41d286043a9286b2e3eb6b84fa4c3308cc2833ef6f54d68',
        tokenRootAddress: '0:6d42d0bc4a6568120ea88bf642edb653d727cfbd35868c47877532de128e71f2',
        apiUrl: 'https://staking.everwallet.net/v1/strategies/main',
        prices: {
            depositAttachedAmount: '2000000000',
            withdrawAttachedAmount: '3000000000',
            removePendingWithdrawAttachedAmount: '2000000000',
        },
        tokenSymbol: 'stEVER',
    },
    'testnet-tycho': {
        vaultAddress: '0:538b6135fd39fc707b0c1459469db104383c431d4d116ffd0d58cc75c95a3f95',
        tokenRootAddress: '0:caab0a342f46d0f32d478a0e90c4ffd61e727ad2b838ea4c2a5825a484960b54',
        apiUrl: 'https://staking-tycho-testnet-test.everwallet.net/v1/strategies/main',
        prices: {
            depositAttachedAmount: '3000000000',
            withdrawAttachedAmount: '3000000000',
            removePendingWithdrawAttachedAmount: '3000000000',
        },
        tokenSymbol: 'stTYCHO',
    },
}

export const DENS_ROOT_ADDRESS_CONFIG: Record<NetworkGroup, string> = {
    mainnet: '0:a7d0694c025b61e1a4a846f1cf88980a5df8adf737d17ac58e35bf172c9fca29',
    testnet: '0:10086efad85fc0168d4090bc29bed834774d9603278e24e3bdbcf0ba3fdd9e45',
}

export const EVERNAME_ADDRESS = '0:a7d0694c025b61e1a4a846f1cf88980a5df8adf737d17ac58e35bf172c9fca29'

export const PWD_MIN_LENGTH = 6
