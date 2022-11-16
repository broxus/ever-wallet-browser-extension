import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { ChangeEvent } from 'react'
import { injectable } from 'tsyringe'

import { AccountabilityStore } from '@app/popup/modules/shared'

@injectable()
export class AccountsListViewModel {

    search = ''

    constructor(private accountability: AccountabilityStore) {
        makeAutoObservable<AccountsListViewModel, any>(this, {
            accountability: false,
        }, { autoBind: true })
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

    public handleSearch(e: ChangeEvent<HTMLInputElement>) {
        this.search = e.target.value
    }

}
