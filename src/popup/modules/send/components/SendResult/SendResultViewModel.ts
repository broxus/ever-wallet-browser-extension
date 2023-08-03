import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Contact } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'
import { NotificationStore } from '@app/popup/modules/shared'

import { SendPageStore } from '../../store'

@injectable()
export class SendResultViewModel {

    error = ''

    loading = false

    constructor(
        private store: SendPageStore,
        private contactsStore: ContactsStore,
        public notification: NotificationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public get recipient(): string {
        return this.store.messageParams!.recipient
    }

}
