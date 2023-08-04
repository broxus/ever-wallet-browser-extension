import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Contact } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'

import { DeployStore } from '../../store'

@injectable()
export class DeployResultViewModel {

    constructor(
        private store: DeployStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public async submit(contact: Contact): Promise<void> {
        await this.contactsStore.addContact(contact)
    }

}
