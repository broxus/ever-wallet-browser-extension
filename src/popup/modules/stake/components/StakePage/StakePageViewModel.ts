import type nt from '@wallet/nekoton-wasm'
import { action, makeAutoObservable, when } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore } from '@app/popup/modules/shared'

@injectable()
export class StakePageViewModel {

    selectedAccount: nt.AssetsList | undefined

    constructor(
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<StakePageViewModel, any>(this, {
            accountability: false,
        }, { autoBind: true })

        when(() => !!this.accountability.selectedAccount, action(() => {
            this.selectedAccount = this.accountability.selectedAccount
        }))
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

}
