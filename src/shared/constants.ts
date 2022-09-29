import type { ConnectionGroup } from '@app/models'

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
export const NATIVE_CURRENCY_DECIMALS = 9

export const TOKENS_MANIFEST_URL = 'https://raw.githubusercontent.com/broxus/ton-assets/master/manifest.json'
export const TOKENS_MANIFEST_REPO = 'https://github.com/broxus/ton-assets'

export const LEDGER_BRIDGE_URL = 'https://broxus.github.io/everscale-ledger-bridge'

export const ST_EVER = 'STEVER'
export const ST_EVER_DECIMALS = 9

export const STAKE_APY_PERCENT = 12
export const STAKE_REMOVE_PENDING_WITHDRAW_AMOUNT = '2000000000' // 2 EVER
export const STAKE_DEPOSIT_ATTACHED_AMOUNT = '2000000000' // 2 EVER
export const STAKE_WITHDRAW_ATTACHED_AMOUNT = '3000000000' // 3 EVER
export const STAKE_TUTORIAL_URL = '#' // TODO

export const ST_EVER_VAULT_ADDRESS_CONFIG: Partial<Record<ConnectionGroup, string>> = {
    mainnet: '0:675a6d63f27e3f24d41d286043a9286b2e3eb6b84fa4c3308cc2833ef6f54d68',
    broxustestnet: '0:c5baaf253d7a88aba9b7f45e8dfcb36bb30e52aec73777211a40dd5481e4bc22',
}

export const ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG: Partial<Record<ConnectionGroup, string>> = {
    mainnet: '0:6d42d0bc4a6568120ea88bf642edb653d727cfbd35868c47877532de128e71f2',
    broxustestnet: '0:fd9ee819d0702fa012c4e42705b905ed5f21bb39f92709d08957998476242586',
}

export const DENS_ROOT_ADDRESS_CONFIG: Partial<Record<string, string>> = {
    mainnet: '0:a7d0694c025b61e1a4a846f1cf88980a5df8adf737d17ac58e35bf172c9fca29',
    testnet: '0:10086efad85fc0168d4090bc29bed834774d9603278e24e3bdbcf0ba3fdd9e45',
}
