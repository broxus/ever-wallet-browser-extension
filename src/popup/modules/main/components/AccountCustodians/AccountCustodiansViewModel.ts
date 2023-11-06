import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, SlidingPanelHandle, SlidingPanelStore } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { Contact } from '@app/models'

@injectable()
export class AccountCustodiansViewModel {

    public address!: string

    constructor(
        public handle: SlidingPanelHandle,
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList | undefined {
        return this.accountability.accountEntries[this.address]
    }

    public get details(): nt.TonWalletDetails | undefined {
        return this.accountability.accountDetails[this.address]
    }

    public get custodians(): string[] {
        return this.accountability.accountCustodians[this.address] ?? []
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

}
