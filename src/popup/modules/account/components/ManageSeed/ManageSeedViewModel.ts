import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStep, AccountabilityStore, ActiveTab, AppConfig, RpcStore } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

@injectable()
export class ManageSeedViewModel {

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private config: AppConfig,
    ) {
        makeAutoObservable(this, {
            filter: false,
        }, { autoBind: true })
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

    public get signerName(): 'master_key' | 'encrypted_key' | 'ledger_key' | undefined {
        return this.currentMasterKey?.signerName
    }

    public get seedName(): string {
        const key = this.currentMasterKey?.masterKey ?? ''
        return this.accountability.masterKeysNames[key] ?? convertPublicKey(key)
    }

    public get accountsByKey(): Record<string, number> {
        return Object.values(this.accountability.accountEntries).reduce((result, account) => {
            if (!result[account.tonWallet.publicKey]) {
                result[account.tonWallet.publicKey] = 0
            }
            result[account.tonWallet.publicKey]++
            return result
        }, {} as Record<string, number>)
    }

    public addKey(): void {
        this.accountability.setStep(AccountabilityStep.CREATE_DERIVED_KEY)
    }

    public onManageDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.onManageDerivedKey(key)
    }

    public onBack(): void {
        this.accountability.reset()
        this.accountability.setStep(AccountabilityStep.MANAGE_SEEDS)
    }

    public filter(list: nt.KeyStoreEntry[], search: string): nt.KeyStoreEntry[] {
        return list.filter((key) => key.name.toLowerCase().includes(search))
    }

}
