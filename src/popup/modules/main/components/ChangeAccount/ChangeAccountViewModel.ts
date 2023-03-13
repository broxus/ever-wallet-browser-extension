import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import { ChangeEvent } from 'react'

import { AccountabilityStore, Drawer, RpcStore } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

@injectable()
export class ChangeAccountViewModel {

    public search = ''

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get items(): Item[] {
        const search = this.search.trim().toLowerCase()
        let items = this._items

        if (search) {
            items = items.filter(
                ({ name, seed }) => name.toLowerCase().includes(search) || seed.toLowerCase().includes(search),
            )
        }

        return items.sort(comparator)
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        return this.accountability.storedKeys
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    private get _items(): Item[] {
        const { storedKeys } = this.accountability
        return Object.values(this.accountability.accountEntries)
            // TODO: check this
            .filter((account) => !!storedKeys[account.tonWallet.publicKey])
            .map<Item>((account) => {
                const key = storedKeys[account.tonWallet.publicKey]
                const { masterKey } = storedKeys[key.masterKey]

                return {
                    address: account.tonWallet.address,
                    name: account.name,
                    seed: this.masterKeysNames[masterKey] || convertPublicKey(masterKey),
                }
            })
    }

    public handleSearch(e: ChangeEvent<HTMLInputElement>): void {
        this.search = e.target.value
    }

    public async handleSelectAccount(address: string): Promise<void> {
        const account = this.accountability.accountEntries[address]
        const key = this.accountability.storedKeys[account.tonWallet.publicKey]

        await this.rpcStore.rpc.selectMasterKey(key.masterKey)
        await this.rpcStore.rpc.selectAccount(account.tonWallet.address)

        this.drawer.close()
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
    seed: string;
}
