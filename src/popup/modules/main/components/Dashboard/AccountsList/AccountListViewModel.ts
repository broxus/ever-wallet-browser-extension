import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class AccountListViewModel {

    public carouselIndex = 0

    public loading = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get keysByMasterKey(): Record<string, nt.KeyStoreEntry[]> {
        return this.accountability.keysByMasterKey
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        return this.rpcStore.state.storedKeys
    }

    public get masterByKey(): Record<string, nt.KeyStoreEntry> {
        return this.accountability.masterKeys.reduce<Record<string, nt.KeyStoreEntry>>((acc, item) => {
            if (!acc[item.masterKey]) acc[item.masterKey] = item
            return acc
        }, {})
    }

    public get masterByPublicKey(): Record<string, string> {
        return Object.entries(this.accountability.keysByMasterKey)
            .reduce<{[k: string]: string}>((acc, [master, keys]) => {
                keys.forEach(key => {
                    acc[key.publicKey] = master
                })
                return acc
            }, {})
    }

    public get accounts(): nt.AssetsList[] {
        return Object.values(this.rpcStore.state.accountEntries)
    }

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.rpcStore.state.accountContractStates
    }

    public filter(list: nt.AssetsList[], query: string): nt.AssetsList[] {
        const q = query.toLowerCase().trim()
        return list.filter(item => item.name.toLowerCase().startsWith(q)
            || item.tonWallet.publicKey.toLowerCase().startsWith(q)
            || item.tonWallet.address.toLowerCase().startsWith(q))
    }

    public async selectAccount(address: string): Promise<void> {
        await this.accountability.selectAccount(address)
    }

}
