import type * as nt from '@broxus/ever-wallet-wasm'
import { action, makeAutoObservable, when } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, Logger, StakeStore } from '@app/popup/modules/shared'

@injectable()
export class StakePageViewModel {

    selectedAccount: nt.AssetsList | undefined

    constructor(
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        when(() => !!this.accountability.selectedAccount, action(() => {
            this.selectedAccount = this.accountability.selectedAccount
        }))

        this.stakeStore.getDetails().catch(this.logger.error)
        this.stakeStore.getPrices().catch(this.logger.error)
        this.stakeStore.fetchInfo().catch(this.logger.error)
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public get ready(): boolean {
        return !!this.stakeStore.prices && !!this.stakeStore.details
    }

}
