import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { ChangeEvent } from 'react'
import { injectable } from 'tsyringe'

import { AccountabilityStep, AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class ManageDerivedKeyViewModel {

    public name = this.accountability.currentDerivedKey?.name ?? ''

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<ManageDerivedKeyViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get currentDerivedKey(): nt.KeyStoreEntry | undefined {
        return this.accountability.currentDerivedKey
    }

    public get currentDerivedKeyAccounts(): nt.AssetsList[] {
        return this.accountability.currentDerivedKeyAccounts
    }

    public get accountsVisibility(): Record<string, boolean> {
        return this.accountability.accountsVisibility
    }

    public get selectedAccountAddress(): string | undefined {
        return this.accountability.selectedAccountAddress
    }

    public get currentDerivedKeyExternalAccounts(): nt.AssetsList[] {
        return this.accountability.currentDerivedKeyExternalAccounts
    }

    public get isSaveVisible(): boolean {
        const name = this.name.trim()

        return !!this.currentDerivedKey && !!name && this.currentDerivedKey.name !== name
    }

    public onNameChange(e: ChangeEvent<HTMLInputElement>): void {
        this.name = e.target.value
    }

    public addAccount(): void {
        this.accountability.setStep(AccountabilityStep.CREATE_ACCOUNT)
    }

    public async saveName(): Promise<void> {
        const name = this.name.trim()

        if (this.currentDerivedKey && name) {
            await this.rpcStore.rpc.updateDerivedKeyName({
                ...this.currentDerivedKey,
                name,
            })

            this.accountability.setCurrentDerivedKey({
                ...this.currentDerivedKey,
                name,
            })
        }
    }

    public onManageAccount(account: nt.AssetsList): void {
        this.accountability.onManageAccount(account)
    }

    public onBack(): void {
        this.accountability.setStep(AccountabilityStep.MANAGE_SEED)
        this.accountability.setCurrentDerivedKey(undefined)
    }

}
