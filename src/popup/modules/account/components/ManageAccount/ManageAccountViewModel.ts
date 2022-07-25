import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { ChangeEvent } from 'react'
import { injectable } from 'tsyringe'

import { Logger } from '@app/shared'
import {
    AccountabilityStep, AccountabilityStore, AppConfig, DrawerContext, RpcStore,
} from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/background'

@injectable()
export class ManageAccountViewModel {

    public name = this.accountability.currentAccount?.name ?? ''

    public drawer!: DrawerContext

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
        private config: AppConfig,
    ) {
        makeAutoObservable<ManageAccountViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            logger: false,
            config: false,
        }, { autoBind: true })
    }

    public get isVisible(): boolean {
        if (this.accountability.currentAccount) {
            return this.accountability.accountsVisibility[this.accountability.currentAccount.tonWallet.address]
        }

        return false
    }

    public get isActive(): boolean {
        const currentAddress = this.accountability.currentAccount?.tonWallet.address
        const selectedAddress = this.accountability.selectedAccount?.tonWallet.address

        return currentAddress === selectedAddress
    }

    public get linkedKeys() {
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
    }

    public get currentAccount(): nt.AssetsList | undefined {
        return this.accountability.currentAccount
    }

    public get isSaveVisible(): boolean {
        const name = this.name.trim()

        return !!this.currentAccount && !!name && this.currentAccount.name !== name
    }

    public handleNameInputChange(e: ChangeEvent<HTMLInputElement>): void {
        this.name = e.target.value
    }

    public async saveName(): Promise<void> {
        const name = this.name.trim()

        if (this.accountability.currentAccount && name) {
            await this.rpcStore.rpc.renameAccount(this.accountability.currentAccount.tonWallet.address, name)
            this.accountability.setCurrentAccount({ ...this.accountability.currentAccount, name })
        }
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
        this.drawer.setPanel(undefined)

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

    public onBack(): void {
        this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY)
        this.accountability.setCurrentAccount(undefined)
    }

}
