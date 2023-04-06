import lte from 'semver/functions/lte'
import browser from 'webextension-polyfill'
import log from 'loglevel'
import type { AccountsStorage, KeyStore } from '@broxus/ever-wallet-wasm'

import type { ExternalAccount } from '@app/models'

import type { StorageMigration } from './Storage'

export class StorageMigrationFactory {

    static removeStakeBannerState = (): StorageMigration => async (from: string) => {
        if (!from || lte(from, '0.3.21')) {
            await browser.storage.local.remove('stakeBannerState')
        }
    }

    static fixInvalidStoredAccounts = (
        accountsStorage: AccountsStorage,
        keyStore: KeyStore,
    ): StorageMigration => async (from: string) => {
        if (!from || lte(from, '0.3.26')) {
            const storedAccounts = await accountsStorage.getStoredAccounts()
            const storedKeys = await keyStore.getKeys()
            const storedExternalAccounts: ExternalAccount[] = (await browser.storage.local.get('externalAccounts')).externalAccounts ?? []

            const publicKeys = new Set<string>(
                storedKeys.map(({ publicKey }) => publicKey),
            )
            const externalAccounts = new Set<string>(
                storedExternalAccounts.map(({ address }) => address),
            )

            for (const account of storedAccounts) {
                if (publicKeys.has(account.tonWallet.publicKey)) continue
                if (externalAccounts.has(account.tonWallet.address)) continue

                try {
                    await accountsStorage.removeAccount(account.tonWallet.address)
                }
                catch (e) {
                    log.warn(e)
                }
            }
        }
    }

}
