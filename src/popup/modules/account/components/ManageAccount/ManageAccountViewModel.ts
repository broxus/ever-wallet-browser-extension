import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { closeCurrentWindow } from '@app/shared'
import {
    AccountabilityStep,
    AccountabilityStore, ActiveTab,
    AppConfig,
    Drawer,
    Logger,
    RpcStore,
} from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { DensContact } from '@app/models'

@injectable()
export class ManageAccountViewModel {

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
        private config: AppConfig,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get isVisible(): boolean {
        if (!this.currentAccount) return false
        return this.accountability.accountsVisibility[this.currentAccount.tonWallet.address]
    }

    public get isActive(): boolean {
        const { currentAccount, selectedAccount } = this.accountability
        return currentAccount?.tonWallet.address === selectedAccount?.tonWallet.address
    }

    public get linkedKeys(): Item[] {
        const publicKey = this.accountability.currentAccount?.tonWallet.publicKey
        const address = this.accountability.currentAccount?.tonWallet.address
        const { storedKeys } = this.accountability

        const keys = Object.values(storedKeys).filter(
            key => key.publicKey === publicKey,
        )

        const externalAccount = this.accountability.externalAccounts.find(
            account => account.address === address,
        )

        if (externalAccount !== undefined) {
            keys.push(
                ...externalAccount.externalIn
                    .map(key => storedKeys[key])
                    .filter(e => e),
            )
        }

        return keys
            .sort((a, b) => a.accountId - b.accountId)
            .map((key) => ({
                key,
                active: this.currentDerivedKeyPubKey === key.publicKey,
                accounts: this.accountability.accountsByKey[key.publicKey] ?? 0,
            }))
    }

    public get currentAccount(): nt.AssetsList | undefined {
        return this.accountability.currentAccount
    }

    public get densContacts(): DensContact[] {
        if (!this.currentAccount) return []
        return this.contactsStore.densContacts[this.currentAccount.tonWallet.address] ?? []
    }

    public get activeTab(): ActiveTab {
        return this.config.activeTab
    }

    private get currentDerivedKeyPubKey(): string | undefined {
        if (this.accountability.selectedAccount) {
            return this.accountability.storedKeys[this.accountability.selectedAccount.tonWallet.publicKey]?.publicKey
        }

        return undefined
    }

    public async onSelectAccount(): Promise<void> {
        if (this.accountability.currentMasterKey?.masterKey == null) {
            return
        }

        await this.rpcStore.rpc.selectMasterKey(this.accountability.currentMasterKey.masterKey)

        if (!this.accountability.currentAccount) {
            return
        }

        await this.rpcStore.rpc.updateAccountVisibility(this.accountability.currentAccount.tonWallet.address, true)
        await this.rpcStore.rpc.selectAccount(this.accountability.currentAccount.tonWallet.address)

        this.accountability.reset()
        this.drawer.close()

        if (this.config.activeTab?.type === 'notification') {
            await closeCurrentWindow()
        }
    }

    public onManageDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.onManageDerivedKey(key)
    }

    public async onToggleVisibility(): Promise<void> {
        if (this.accountability.currentAccount && !this.isActive) {
            await this.rpcStore.rpc.updateAccountVisibility(
                this.accountability.currentAccount.tonWallet.address,
                !this.isVisible,
            )
        }
    }

    public async onDelete(): Promise<void> {
        if (!this.currentAccount) return

        await this.rpcStore.rpc.removeAccount(this.currentAccount.tonWallet.address)
        await this.rpcStore.rpc.selectFirstAccount()

        this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY)
        this.accountability.setCurrentAccountAddress(undefined)
    }

    public onBack(): void {
        this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY)
        this.accountability.setCurrentAccountAddress(undefined)
    }

    public filter(list: Item[], search: string): Item[] {
        return list.filter(({ key }) => key.name.toLowerCase().includes(search))
    }

}

interface Item {
    key: nt.KeyStoreEntry;
    active: boolean;
    accounts: number;
}
