import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import type * as nt from '@broxus/ever-wallet-wasm'

import {
    AccountabilityStep,
    AccountabilityStore,
    Drawer,
    LocalizationStore,
    Panel,
    RpcStore,
} from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class AccountSettingsViewModel {

    public dropdownActive = false

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get version(): string {
        return process.env.EXT_VERSION ?? ''
    }

    public get selectedLocale(): string {
        return this.localization.locale
    }

    public get selectedMasterKey(): string | undefined {
        return this.accountability.selectedMasterKey
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get recentMasterKeys(): nt.KeyStoreEntry[] {
        return this.accountability.recentMasterKeys.filter(
            ({ masterKey }) => masterKey !== this.selectedMasterKey,
        )
    }

    public toggleDropdown(): void {
        this.dropdownActive = !this.dropdownActive
    }

    public hideDropdown(): void {
        this.dropdownActive = false
    }

    public async manageSeeds(): Promise<void> {
        this.hideDropdown()

        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'manage_seeds',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async selectMasterKey(masterKey: string): Promise<void> {
        const key = this.accountability.masterKeys.find(entry => entry.masterKey === masterKey)

        if (!key) return

        this.hideDropdown()

        if (key.masterKey === this.selectedMasterKey) return

        const accounts = this.accountability.getAccountsByMasterKey(masterKey)
        const account = accounts.find(
            ({ tonWallet }) => this.accountability.accountsVisibility[tonWallet.address],
        ) ?? accounts.at(0)

        if (!account) {
            this.accountability.setCurrentMasterKey(key)
            this.accountability.setStep(AccountabilityStep.MANAGE_SEED)

            this.drawer.setPanel(Panel.ACCOUNTS_MANAGER)
        }
        else {
            await this.rpcStore.rpc.selectMasterKey(key.masterKey)
            await this.rpcStore.rpc.selectAccount(account.tonWallet.address)

            this.drawer.close()
        }
    }

    public async openContacts(): Promise<void> {
        this.hideDropdown()

        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'contacts',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public openLanguage(): void {
        this.hideDropdown()
        this.drawer.setPanel(Panel.LANGUAGE)
    }

    public logOut(): Promise<void> {
        return this.accountability.logOut()
    }

}
