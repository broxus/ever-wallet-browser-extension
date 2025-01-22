import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class AccountListViewModel {

    constructor(private rpcStore: RpcStore, private accountability: AccountabilityStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get keysByMasterKey(): Record<string, nt.KeyStoreEntry[]> {
        return this.accountability.keysByMasterKey
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        return this.accountability.storedKeys
    }

    public get masterByKey(): Record<string, nt.KeyStoreEntry> {
        return this.accountability.masterKeys.reduce<Record<string, nt.KeyStoreEntry>>((acc, item) => {
            if (!acc[item.masterKey]) {
                acc[item.masterKey] = item
            }
            return acc
        }, {})
    }

    public get masterByPublicKey(): Record<string, string> {
        return Object.entries(this.accountability.keysByMasterKey)
            .reduce<{ [k: string]: string }>((acc, [master, keys]) => {
                keys.forEach((key) => {
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

        return list.filter((item) => {
            const publicKey = this.accountability.storedKeys[item.tonWallet.publicKey]
            const master = this.masterByKey[publicKey.masterKey]

            return item.name.toLowerCase().startsWith(q)
                || item.tonWallet.publicKey.toLowerCase().startsWith(q)
                || item.tonWallet.address.toLowerCase().startsWith(q)
                || publicKey.name.toLowerCase().startsWith(q)
                || publicKey.publicKey.toLowerCase().startsWith(q)
                || master.name.toLowerCase().startsWith(q)
                || master.masterKey.toLowerCase().startsWith(q)
        })
    }

    public async selectAccount(address: string, master: string): Promise<void> {
        await this.rpcStore.rpc.selectMasterKey(master)
        await this.accountability.selectAccount(address)
    }

    public async createAccount(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'create_account',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async manageSeeds(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'manage_seeds',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

}
