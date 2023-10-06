import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, SlidingPanelHandle, SlidingPanelStore } from '@app/popup/modules/shared'

@injectable()
export class AccountPreferenceViewModel {

    public address!: string

    constructor(
        public handle: SlidingPanelHandle,
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList | undefined {
        return this.accountability.accountEntries[this.address]
    }

    public get canRemove(): boolean {
        return this.accountability.accounts.length > 1
    }

}
