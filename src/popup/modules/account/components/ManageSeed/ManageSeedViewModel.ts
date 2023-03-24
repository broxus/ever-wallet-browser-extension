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
        if (this.accountability.selectedAccount) {
            return this.accountability.storedKeys[this.accountability.selectedAccount.tonWallet.publicKey]?.publicKey
        }

        return undefined
    }

    public get derivedKeys(): Item[] {
        return this.accountability.derivedKeys
            .sort((a, b) => a.accountId - b.accountId)
            .map((key) => ({
                key,
                active: this.currentDerivedKeyPubKey === key.publicKey,
                accounts: this.accountability.accountsByKey[key.publicKey] ?? 0,
            }))
    }

    public get signerName(): 'master_key' | 'encrypted_key' | 'ledger_key' | undefined {
        return this.currentMasterKey?.signerName
    }

    public get seedName(): string {
        const key = this.currentMasterKey?.masterKey ?? ''
        return this.accountability.masterKeysNames[key] ?? convertPublicKey(key)
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

    public filter(list: Item[], search: string): Item[] {
        return list.filter(({ key }) => key.name.toLowerCase().includes(search))
    }

}

interface Item {
    key: nt.KeyStoreEntry;
    active: boolean;
    accounts: number;
}
