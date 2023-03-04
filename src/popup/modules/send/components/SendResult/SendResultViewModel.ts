import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { Contact } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'
import { parseError } from '@app/popup/utils'

@injectable()
export class SendResultViewModel {

    state: 'initial' | 'form' | 'submitted' = 'initial'

    error = ''

    loading = false

    constructor(private contactsStore: ContactsStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts
    }

    public handleAdd(): void {
        this.state = 'form'
    }

    public async submit(value: FormValue): Promise<void> {
        this.error = ''
        this.loading = true

        try {
            await this.contactsStore.addContact(value)

            runInAction(() => {
                this.state = 'submitted'
            })
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
    address: string;
    name: string;
}
