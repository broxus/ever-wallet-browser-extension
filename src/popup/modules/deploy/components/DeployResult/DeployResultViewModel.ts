import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Contact } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'

@injectable()
export class DeployResultViewModel {

    constructor(private contactsStore: ContactsStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public async submit(contact: Contact): Promise<void> {
        await this.contactsStore.addContact(contact)
    }

}
