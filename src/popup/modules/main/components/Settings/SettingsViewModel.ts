import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, Router, RpcStore } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class SettingsViewModel {

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get selectedMasterKey(): string | undefined {
        return this.accountability.selectedMasterKey
    }

    public get masterKey(): nt.KeyStoreEntry | undefined {
        if (!this.selectedMasterKey) return undefined
        return this.accountability.storedKeys[this.selectedMasterKey]
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get version(): string {
        return process.env.EXT_VERSION ?? ''
    }

    public get recentMasterKeys(): nt.KeyStoreEntry[] {
        return this.accountability.recentMasterKeys
            .filter(({ masterKey }) => masterKey !== this.selectedMasterKey)
            .slice(0, 3)
    }

    public get keysByMasterKey(): Record<string, nt.KeyStoreEntry[]> {
        return this.accountability.keysByMasterKey
    }

    public async manageSeeds(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'manage_seeds',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
        this.router.navigate('/')
    }

    public async openContacts(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'contacts',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public logOut(): Promise<void> {
        return this.accountability.logOut()
    }

    public async selectMasterKey(masterKey: string): Promise<void> {
        const key = this.accountability.masterKeys.find(entry => entry.masterKey === masterKey)

        if (!key) return

        if (key.masterKey === this.selectedMasterKey) return

        const accounts = this.accountability.getAccountsByMasterKey(masterKey)
        const account = accounts.find(
            ({ tonWallet }) => this.accountability.accountsVisibility[tonWallet.address],
        ) ?? accounts.at(0)

        this.router.navigate('/')
        await this.rpcStore.rpc.selectMasterKey(key.masterKey)

        if (account) {
            await this.accountability.selectAccount(account.tonWallet.address)
        }
    }

}
