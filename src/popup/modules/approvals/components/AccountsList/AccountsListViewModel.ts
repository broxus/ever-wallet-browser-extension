import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore } from '@app/popup/modules/shared'

@injectable()
export class AccountsListViewModel {

    constructor(private accountability: AccountabilityStore) {
        makeAutoObservable<AccountsListViewModel, any>(this, {
            accountability: false,
        }, { autoBind: true })
    }

    public get accountEntries(): Record<string, nt.AssetsList> {
        return this.accountability.accountEntries
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.accountability.accountContractStates
    }

}
