import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { ChangeEvent } from 'react'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore } from '@app/popup/modules/shared'

@injectable()
export class AccountsListViewModel {

    search = ''

    constructor(
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get accountEntries(): nt.AssetsList[] {
        const search = this.search.trim().toLowerCase()
        const entries = Object.values(this.accountability.accountEntries)

        if (search) {
            return entries.filter(
                account => account.name.toLowerCase().includes(search)
                    || account.tonWallet.address.toLowerCase().includes(search)
                    || account.tonWallet.publicKey.toLowerCase().includes(search),
            )
        }

        return entries
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.accountability.accountContractStates
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public handleSearch(e: ChangeEvent<HTMLInputElement>) {
        this.search = e.target.value
    }

}
