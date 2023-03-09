import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import { ChangeEvent } from 'react'

import { AccountabilityStore, Drawer, RpcStore } from '@app/popup/modules/shared'

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

    get accounts(): nt.AssetsList[] {
        const search = this.search.trim().toLowerCase()
        const { storedKeys } = this.accountability
        const accounts = Object.values(this.accountability.accountEntries).filter(
            // TODO: check this
            (account) => !!storedKeys[account.tonWallet.publicKey],
        )

        if (!search) {
            return accounts.sort(comparator)
        }

        return accounts
            .filter(({ name }) => name.toLowerCase().includes(search))
            .sort(comparator)
    }

    public handleSearch(e: ChangeEvent<HTMLInputElement>): void {
        this.search = e.target.value
    }

    public async handleSelectAccount(account: nt.AssetsList): Promise<void> {
        const key = this.accountability.storedKeys[account.tonWallet.publicKey]

        await this.rpcStore.rpc.selectMasterKey(key.masterKey)
        await this.rpcStore.rpc.selectAccount(account.tonWallet.address)

        this.drawer.close()
    }

}

function comparator(a: nt.AssetsList, b: nt.AssetsList): number {
    const byName = a.name.localeCompare(b.name)
    if (byName !== 0) return byName
    return a.tonWallet.address.localeCompare(b.tonWallet.address)
}
