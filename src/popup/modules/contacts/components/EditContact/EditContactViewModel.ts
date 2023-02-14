import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import { Contact, Nekoton } from '@app/models'
import { NekotonToken } from '@app/popup/modules/shared'

import { ContactsStore } from '../../store'

@injectable()
export class EditContactViewModel {

    public address!: string

    public onResult!: () => void

    public loading = false

    public error = ''

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contact(): Contact | undefined {
        return this.contactsStore.contacts[this.address]
    }

    public async submit({ name }: FormValue): Promise<void> {
        this.error = ''
        this.loading = true

        if (!this.contact) return

        try {
            await this.contactsStore.updateContact({
                ...this.contact,
                name,
            })
            this.onResult()
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
