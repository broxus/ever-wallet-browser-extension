import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, SlidingPanelStore } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { Contact } from '@app/models'

@injectable()
export class CustodianListViewModel {

    public address!: string

    constructor(
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        return this.accountability.storedKeys
    }

    public get custodians(): string[] {
        return this.accountability.accountCustodians[this.address] ?? []
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

}
