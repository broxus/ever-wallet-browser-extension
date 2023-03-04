import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import { ChangeEvent } from 'react'

import { Drawer, RpcStore } from '@app/popup/modules/shared'
import { Contact } from '@app/models'

import { ContactsStore } from '../../store'

@injectable()
export class ChooseContactViewModel {

    search = ''

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get recentContacts(): string[] {
        return filter(this.search, this.contactsStore.recentContacts)
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public get contactsList(): Contact[] {
        return filter(this.search, Object.values(this.contacts))
    }

    public get empty(): boolean {
        return this.contactsStore.recentContacts.length === 0 && Object.values(this.contacts).length === 0
    }

    public handleSearchChange(e: ChangeEvent<HTMLInputElement>): void {
        this.search = e.target.value
    }

    public async removeRecentContact(address: string): Promise<void> {
        await this.contactsStore.removeRecentContact(address)
    }

    public async removeContact(address: string): Promise<void> {
        await this.contactsStore.removeContact(address)
    }

}

function filter<T extends Array<Contact | string>>(search: string, array: T): T {
    if (!search) return array
    const _search = search.toLowerCase()
    return array.filter((item) => {
        if (typeof item === 'string') {
            return item.toLowerCase().includes(_search)
        }

        return item.name.toLowerCase().includes(_search)
            || item.address.toLowerCase().includes(_search)
    }) as T
}
