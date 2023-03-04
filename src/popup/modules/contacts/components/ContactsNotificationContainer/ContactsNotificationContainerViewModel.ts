import { makeAutoObservable } from 'mobx'
import { Disposable, injectable } from 'tsyringe'

import { ContactsStore } from '../../store'

@injectable()
export class ContactsNotificationContainerViewModel implements Disposable {

    constructor(private contactsStore: ContactsStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    get undoOpened(): boolean {
        return !!this.contactsStore.lastRemovedContact
    }

    get addedOpened(): boolean {
        return !!this.contactsStore.lastAddedContact
    }

    public dispose(): Promise<void> | void {
        this.contactsStore.resetLastRemovedContact()
        this.contactsStore.resetLastAddedContact()
    }

    public async handleUndo(): Promise<void> {
        if (!this.contactsStore.lastRemovedContact) return

        await this.contactsStore.addContact(this.contactsStore.lastRemovedContact)
        this.contactsStore.resetLastRemovedContact()
        this.contactsStore.resetLastAddedContact()
    }

    public handleCloseUndo(): void {
        this.contactsStore.resetLastRemovedContact()
    }

    public handleCloseAdded(): void {
        this.contactsStore.resetLastAddedContact()
    }

}
