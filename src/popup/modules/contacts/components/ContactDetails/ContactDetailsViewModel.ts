import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Contact } from '@app/models'
import { RpcStore } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

import { ContactsStore } from '../../store'

@injectable()
export class ContactDetailsViewModel {

    public address!: string

    public onClose!: () => void

    public edit = false

    constructor(
        private rpcStore: RpcStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contact(): Contact | undefined {
        return this.contactsStore.contacts[this.address]
    }

    public openEdit(): void {
        this.edit = true
    }

    public closeEdit(): void {
        this.edit = false
    }

    public async removeContact(): Promise<void> {
        if (!this.contact) return

        await this.contactsStore.removeContact(this.contact.address)
        this.onClose()
    }

    public async handleSend(): Promise<void> {
        await this.rpcStore.rpc.tempStorageInsert('selected_address', this.address)
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'send',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })

        this.onClose()
    }

}
