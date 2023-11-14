import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'
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
        private rpcStore: RpcStore,
        private contactsStore: ContactsStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get name(): string {
        return this.storedKey?.name || this.contact?.name || ''
    }

    private get contact(): Contact | undefined {
        return this.contactsStore.contacts[this.publicKey]
    }

    private get storedKey(): nt.KeyStoreEntry | undefined {
        return this.accountability.storedKeys[this.publicKey]
    }

    public async submit({ name }: FormValue): Promise<void> {
        this.loading = true
        this.error = ''

        try {
            if (this.storedKey) {
                await this.rpcStore.rpc.updateDerivedKeyName({
                    ...this.storedKey,
                    name,
                })
            }
            else {
                await this.contactsStore.updateContact({
                    type: 'public_key',
                    value: this.publicKey,
                    name,
                })
            }

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
