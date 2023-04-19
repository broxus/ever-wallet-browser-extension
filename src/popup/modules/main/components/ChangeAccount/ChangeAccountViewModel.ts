import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, Drawer, RpcStore } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'
import type { ExternalAccount } from '@app/models'

@injectable()
export class ChangeAccountViewModel {

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, {
            filter: false,
        }, { autoBind: true })
    }

    public get items(): Item[] {
        const { storedKeys, accountEntries, externalAccounts, masterKeysNames } = this.accountability
        const external = new Map<string, ExternalAccount>(
            externalAccounts.map((account) => [account.address, account]),
        )

        return Object.values(accountEntries)
            .reduce((accounts, account) => {
                let key = storedKeys[account.tonWallet.publicKey] as nt.KeyStoreEntry | undefined

                if (!key && external.has(account.tonWallet.address)) {
                    const { externalIn } = external.get(account.tonWallet.address)!
                    for (const publicKey of externalIn) {
                        key = storedKeys[publicKey]
                        if (key) break
                    }
                }

                if (key) {
                    accounts.push({
                        address: account.tonWallet.address,
                        name: account.name,
                        masterKey: key.masterKey,
                        masterKeyName: masterKeysNames[key.masterKey] || convertPublicKey(key.masterKey),
                    })
                }

                return accounts
            }, [] as Item[])
            .sort(comparator)
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        return this.accountability.storedKeys
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public async handleSelectAccount(address: string, masterKey: string): Promise<void> {
        await this.rpcStore.rpc.selectMasterKey(masterKey)
        await this.rpcStore.rpc.selectAccount(address)

        this.drawer.close()
    }

    public filter(list: Item[], search: string): Item[] {
        return list.filter(
            ({ address, name, masterKeyName }) => name.toLowerCase().includes(search)
                || masterKeyName.toLowerCase().includes(search)
                || address.includes(search),
        )
    }

}

function comparator(a: Item, b: Item): number {
    const byName = a.name.localeCompare(b.name)
    if (byName !== 0) return byName
    return a.address.localeCompare(b.address)
}

interface Item {
    address: string;
    name: string;
    masterKey: string;
    masterKeyName: string;
}
