import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { SlidingPanelHandle } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { Contact } from '@app/models'
import { parseError } from '@app/popup/utils'

@injectable()
export class RenameCustodianViewModel {

    public publicKey!: string

    public loading = false

    public error = ''

    constructor(
        public handle: SlidingPanelHandle,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contact(): Contact | undefined {
        return this.contactsStore.contacts[this.publicKey]
    }

    public async submit({ name }: FormValue): Promise<void> {
        const contact: Contact = {
            type: 'public_key',
            value: this.publicKey,
            name,
        }

        this.loading = true
        this.error = ''

        try {
            await this.contactsStore.updateContact(contact)
            this.handle.close()
        }
        catch (e) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}

export interface FormValue {
    name: string;
}
