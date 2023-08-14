import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, Router, RpcStore, SlidingPanelStore } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

@injectable()
export class ManageSeedViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, {
            filter: false,
        }, { autoBind: true })
    }

    public get selectedMasterKey(): string | undefined {
        return this.accountability.selectedMasterKey
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

    public async selectMasterKey(): Promise<void> {
        const key = this.currentMasterKey!
        const accounts = this.accountability.getAccountsByMasterKey(key.masterKey)
        const account = accounts.find(
            ({ tonWallet }) => this.accountability.accountsVisibility[tonWallet.address],
        ) ?? accounts.at(0)

        if (!account) {
            this.accountability.setCurrentMasterKey(key)
        }
        else {
            await this.rpcStore.rpc.selectMasterKey(key.masterKey)
            await this.rpcStore.rpc.selectAccount(account.tonWallet.address)
        }
    }

    public addKey(): void {
        this.router.navigate('add-key')
    }

    public onManageDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.onManageDerivedKey(key)
        this.router.navigate('../key')
    }

    public onSeedDeleted(): void {
        this.router.navigate('..')
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
