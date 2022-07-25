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

    step = createEnumField(Step, Step.Index)

    name = this.accountability.currentMasterKey
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
        })
    }

    get activeTab(): ActiveTab {
        return this.config.activeTab
    }

    get currentDerivedKeyPubKey(): string | undefined {
        if (this.accountability.selectedAccount?.tonWallet.publicKey) {
            return this.accountability.storedKeys[this.accountability.selectedAccount.tonWallet.publicKey]?.publicKey
        }

        return undefined
    }

    get derivedKeys(): nt.KeyStoreEntry[] {
        return this.accountability.derivedKeys
            .sort((a, b) => a.accountId - b.accountId)
    }

    get isSaveVisible(): boolean {
        const masterKey = this.accountability.currentMasterKey?.masterKey
        const name = this.name.trim()

        return !!masterKey && !!name && this.accountability.masterKeysNames[masterKey] !== name
    }

    get signerName(): 'master_key' | 'encrypted_key' | 'ledger_key' | undefined {
        return this.accountability.currentMasterKey?.signerName
    }

    onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.name = e.target.value
    }

    addKey = () => this.accountability.setStep(AccountabilityStep.CREATE_DERIVED_KEY)

    saveName = async () => {
        const name = this.name.trim()

        if (this.accountability.currentMasterKey && name) {
            await this.rpcStore.rpc.updateMasterKeyName(this.accountability.currentMasterKey.masterKey, name)
        }
    }

    onManageDerivedKey = (key: nt.KeyStoreEntry) => this.accountability.onManageDerivedKey(key)

    onBack = () => {
        switch (this.step.value) {
            case Step.ExportSeed:
                this.step.setIndex()
                break

            default:
                this.accountability.reset()
                this.accountability.setStep(AccountabilityStep.MANAGE_SEEDS)
                break
        }
    }

}

export enum Step {
    Index,
    ExportSeed,
}
