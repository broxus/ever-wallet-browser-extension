import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import { isNativeAddress } from '@app/shared'
import type { Nekoton } from '@app/models'
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
        if (this.nekoton.checkAddress(value)) return true
        if (isPublickKey(value)) {
            try {
                this.nekoton.checkPublicKey(value)
                return true
            }
            catch {
                return false
            }
        }
        if (!isNativeAddress(value)) {
            const address = await this.contactsStore.resolveDensPath(value)
            return !!address
        }

        return false
    }

    public async submit({ value, name }: FormValue): Promise<void> {
        this.error = ''
        this.loading = true

        try {
            await this.contactsStore.addContact({
                type: isPublickKey(value) ? 'public_key' : 'address',
                value: this.contactsStore.tryRepackAddress(value) ?? value,
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

    private tryRepackAddress(address: string): string | null {
        try {
            return this.nekoton.repackAddress(address)
        }
        catch {
            return null
        }
    }

}

const keyregexp = /^[a-fA-F0-9]{64}$/

function isPublickKey(value: string): boolean {
    return !!value.match(keyregexp)
}

export interface FormValue {
    value: string;
    name: string;
}
