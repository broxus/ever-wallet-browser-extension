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

    public get masterCount(): number {
        return this.accountability.masterKeys.length
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

            return item.name.toLowerCase().includes(q)
                || item.tonWallet.publicKey.toLowerCase().includes(q)
                || item.tonWallet.address.toLowerCase().includes(q)
                || publicKey.name.toLowerCase().includes(q)
                || publicKey.publicKey.toLowerCase().includes(q)
                || master.name.toLowerCase().includes(q)
                || master.masterKey.toLowerCase().includes(q)
        })
    }

    public async selectAccount(tonWallet: nt.TonWalletAsset): Promise<void> {
        const master = this.masterByPublicKey[tonWallet.publicKey]
        await this.rpcStore.rpc.selectMasterKey(master)
        await this.accountability.selectAccount(tonWallet.address)
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
