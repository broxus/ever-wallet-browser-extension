import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import { ChangeEvent } from 'react'

import { Drawer, RpcStore } from '@app/popup/modules/shared'
import { Contact, RawContact } from '@app/models'

import { ContactsStore } from '../../store'

@injectable()
export class ChooseContactViewModel {

    type!: RawContact['type']

    search = ''

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get recentContacts(): RawContact[] {
        return filter(this.search, this._recentContacts)
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public get contactsList(): Contact[] {
        return filter(this.search, this._contacts)
    }

    public get empty(): boolean {
        return this._recentContacts.length === 0 && this._contacts.length === 0
    }

    private get _recentContacts(): RawContact[] {
        return this.contactsStore.recentContacts.filter(({ type }) => type === this.type)
    }

    private get _contacts(): Contact[] {
        return Object.values(this.contactsStore.contacts).filter(({ type }) => type === this.type)
    }

    public handleSearchChange(e: ChangeEvent<HTMLInputElement>): void {
        this.search = e.target.value
    }

    public async removeRecentContact(value: string): Promise<void> {
        await this.contactsStore.removeRecentContact(value)
    }

    public async removeContact(address: string): Promise<void> {
        await this.contactsStore.removeContact(address)
    }

}

function filter<T extends Array<RawContact | Contact>>(search: string, array: T): T {
    if (!search) return array
    const _search = search.toLowerCase()
    return array.filter(
        (item: Partial<Contact>) => item.value?.toLowerCase().includes(_search)
            || item.name?.toLowerCase().includes(_search),
    ) as T
}
