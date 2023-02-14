import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import { isNativeAddress } from '@app/shared'
import { Nekoton } from '@app/models'
import { NekotonToken } from '@app/popup/modules/shared'

import { ContactsStore } from '../../store'

@injectable()
export class AddContactViewModel {

    public onResult!: () => void

    public loading = false

    public error = ''

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async validateAddress(value: string): Promise<boolean> {
        if (!value) return false
        if (isNativeAddress(value)) return this.nekoton.checkAddress(value)

        const address = await this.contactsStore.resolveDensPath(value)

        return !!address
    }

    public async submit(value: FormValue): Promise<void> {
        this.error = ''
        this.loading = true

        try {
            await this.contactsStore.addContact(value)
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
    address: string;
    name: string;
}
