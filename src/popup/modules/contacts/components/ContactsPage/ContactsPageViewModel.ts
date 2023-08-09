import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Contact } from '@app/models'

import { ContactsStore } from '../../store'

@injectable()
export class ContactsPageViewModel {

    constructor(private contactsStore: ContactsStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contacts(): Contact[] {
        return Object.values(this.contactsStore.contacts)
    }

    public get empty(): boolean {
        return this.contacts.length === 0
    }

    public async removeContact(address: string): Promise<void> {
        await this.contactsStore.removeContact(address)
    }

    public filter(list: Contact[], search: string): Contact[] {
        return list.filter(
            (item) => item.name.toLowerCase().includes(search) || item.value.toLowerCase().includes(search),
        )
    }

}
