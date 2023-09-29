import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Contact } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'

import { AssetTransferStore } from '../../store'

@injectable()
export class SendResultViewModel {

    showContact = false

    error = ''

    loading = false

    constructor(
        private transfer: AssetTransferStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.showContact = !this.contacts[this.recipient]
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public get recipient(): string {
        return this.transfer.messageParams!.recipient
    }

}
