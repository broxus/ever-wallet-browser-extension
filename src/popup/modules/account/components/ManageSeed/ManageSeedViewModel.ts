import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import {
    AccountabilityStep,
    AccountabilityStore,
    ActiveTab,
    AppConfig,
    createEnumField,
    RpcStore,
} from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

@injectable()
export class ManageSeedViewModel {

    public step = createEnumField<typeof Step>(Step.Index)

    public changePassword = false

    public changePasswordNotification = false

    // public name = this.currentMasterKey ? this.accountability.masterKeysNames[this.currentMasterKey.masterKey] ?? '' : ''

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private config: AppConfig,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get activeTab(): ActiveTab {
        return this.config.activeTab
    }

    public get currentMasterKey(): nt.KeyStoreEntry | undefined {
        return this.accountability.currentMasterKey
    }

    public get currentDerivedKeyPubKey(): string | undefined {
        if (this.accountability.selectedAccount?.tonWallet.publicKey) {
            return this.accountability.storedKeys[this.accountability.selectedAccount.tonWallet.publicKey]?.publicKey
        }

        return undefined
    }

    public get derivedKeys(): nt.KeyStoreEntry[] {
        return this.accountability.derivedKeys
            .sort((a, b) => a.accountId - b.accountId)
    }

    // public get isSaveVisible(): boolean {
    //     const masterKey = this.currentMasterKey?.masterKey
    //     const name = this.name.trim()
    //
    //     return !!masterKey && !!name && this.accountability.masterKeysNames[masterKey] !== name
    // }

    public get signerName(): 'master_key' | 'encrypted_key' | 'ledger_key' | undefined {
        return this.currentMasterKey?.signerName
    }

    public get isCurrentSeed(): boolean {
        return this.accountability.selectedMasterKey === this.currentMasterKey?.masterKey
    }

    public get seedName(): string {
        const key = this.currentMasterKey?.masterKey ?? ''
        return this.accountability.masterKeysNames[key] ?? convertPublicKey(key)
    }

    // public onNameChange(e: ChangeEvent<HTMLInputElement>): void {
    //     this.name = e.target.value
    // }

    public addKey(): void {
        this.accountability.setStep(AccountabilityStep.CREATE_DERIVED_KEY)
    }

    // public async saveName(): Promise<void> {
    //     const name = this.name.trim()
    //
    //     if (this.currentMasterKey && name) {
    //         await this.rpcStore.rpc.updateMasterKeyName(this.currentMasterKey.masterKey, name)
    //     }
    // }

    public onManageDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.onManageDerivedKey(key)
    }

    public onBack(): void {
        this.accountability.reset()
        this.accountability.setStep(AccountabilityStep.MANAGE_SEEDS)
    }

    public openChangePassword(): void {
        this.changePassword = true
    }

    public closeChangePassword(): void {
        this.changePassword = false
    }

    public handlePasswordChanged(): void {
        this.changePassword = false
        this.changePasswordNotification = true
    }

    public closeChangePasswordNotification(): void {
        this.changePasswordNotification = false
    }

}

export enum Step {
    Index,
    ExportSeed,
    DeleteSeed,
}
