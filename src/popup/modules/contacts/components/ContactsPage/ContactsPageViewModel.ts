import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import { ChangeEvent } from 'react'

import { Drawer, RpcStore } from '@app/popup/modules/shared'
import { Contact } from '@app/models'

import { ContactsStore } from '../../store'
import { closeCurrentWindow } from '@app/shared'

@injectable()
export class ContactsPageViewModel {

    search = ''

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public get contactsList(): Contact[] {
        return filter(this.search, Object.values(this.contacts))
    }

    public get empty(): boolean {
        return Object.values(this.contacts).length === 0
    }

    public handleSearchChange(e: ChangeEvent<HTMLInputElement>): void {
        this.search = e.target.value
    }

    public async removeContact(address: string): Promise<void> {
        await this.contactsStore.removeContact(address)
    }

    public async handleBack(): Promise<void> {
        await closeCurrentWindow()
    }

}

function filter(search: string, array: Contact[]): Contact[] {
    if (!search) return array
    const _search = search.toLowerCase()
    return array.filter(
        (item) => item.name.toLowerCase().includes(_search) || item.address.toLowerCase().includes(_search),
    )
}
