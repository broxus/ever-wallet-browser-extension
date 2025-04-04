import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { ChangeEvent } from 'react'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore } from '@app/popup/modules/shared'

@injectable()
export class AccountsListViewModel {

    public search = ''

    constructor(
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get accountEntries(): nt.AssetsList[] {
        const search = this.search.trim().toLowerCase()
        let entries = Object.values(this.accountability.accountEntries)
            .filter(
                (entry): entry is nt.AssetsList => entry !== undefined,
            )

        if (search) {
            entries = entries.filter(
                (account) => account.name.toLowerCase().includes(search)
                    || account.tonWallet.address.toLowerCase().includes(search)
                    || account.tonWallet.publicKey.toLowerCase().includes(search),
            )
        }

        return entries.sort(comparator)
    }

    public get contractStates(): Record<string, nt.ContractState> {
        return this.accountability.accountContractStates
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get decimals(): number {
        return this.connectionStore.decimals
    }

    public handleSearch(e: ChangeEvent<HTMLInputElement>) {
        this.search = e.target.value
    }

}

function comparator(a: nt.AssetsList, b: nt.AssetsList): number {
    const byName = a.name.localeCompare(b.name)
    if (byName !== 0) return byName
    return a.tonWallet.address.localeCompare(b.tonWallet.address)
}
