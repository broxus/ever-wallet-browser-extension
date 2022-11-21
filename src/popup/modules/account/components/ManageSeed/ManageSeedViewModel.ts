import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { ChangeEvent } from 'react'
import { injectable } from 'tsyringe'

import {
    AccountabilityStep,
    AccountabilityStore,
    ActiveTab,
    AppConfig,
    createEnumField,
    RpcStore,
} from '@app/popup/modules/shared'

@injectable()
export class ManageSeedViewModel {

    public step = createEnumField(Step, Step.Index)

    public name = this.accountability.currentMasterKey
        ? this.accountability.masterKeysNames[this.accountability.currentMasterKey.masterKey] ?? '' : ''

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private config: AppConfig,
    ) {
        makeAutoObservable<ManageSeedViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            config: false,
        }, { autoBind: true })
    }

    public get activeTab(): ActiveTab {
        return this.config.activeTab
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

    public get isSaveVisible(): boolean {
        const masterKey = this.accountability.currentMasterKey?.masterKey
        const name = this.name.trim()

        return !!masterKey && !!name && this.accountability.masterKeysNames[masterKey] !== name
    }

    public get signerName(): 'master_key' | 'encrypted_key' | 'ledger_key' | undefined {
        return this.accountability.currentMasterKey?.signerName
    }

    public get isCurrentSeed(): boolean {
        return this.accountability.selectedMasterKey === this.accountability.currentMasterKey?.masterKey
    }

    public onNameChange(e: ChangeEvent<HTMLInputElement>): void {
        this.name = e.target.value
    }

    public addKey(): void {
        this.accountability.setStep(AccountabilityStep.CREATE_DERIVED_KEY)
    }

    public async saveName(): Promise<void> {
        const name = this.name.trim()

        if (this.accountability.currentMasterKey && name) {
            await this.rpcStore.rpc.updateMasterKeyName(this.accountability.currentMasterKey.masterKey, name)
        }
    }

    public onManageDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.onManageDerivedKey(key)
    }

    public onBack(): void {
        this.accountability.reset()
        this.accountability.setStep(AccountabilityStep.MANAGE_SEEDS)
    }

}

export enum Step {
    Index,
    ExportSeed,
    DeleteSeed,
}
