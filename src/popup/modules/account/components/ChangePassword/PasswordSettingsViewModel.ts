import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, NotificationStore, RpcStore, SettingsStore, SlidingPanelHandle } from '@app/popup/modules/shared'

@injectable()
export class PasswordSettingsViewModel {

    public keyEntry!: nt.KeyStoreEntry

    public loading = false

    constructor(
        public handle: SlidingPanelHandle,
        public notification: NotificationStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private settings: SettingsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get cachePassword(): boolean {
        return this.settings.data[this.keyEntry.masterKey]?.cache ?? false
    }

    public async submit({ oldPassword, newPassword, cache }: FormValue) {
        if (this.loading) return

        this.loading = true

        try {
            const { signerName, masterKey, publicKey } = this.keyEntry

            if (newPassword) {
                let data: nt.ChangeKeyPassword

                switch (signerName) {
                    case 'master_key':
                        data = {
                            type: 'master_key',
                            data: { masterKey, oldPassword, newPassword },
                        }
                        break
                    case 'encrypted_key':
                        data = {
                            type: 'encrypted_key',
                            data: { publicKey, oldPassword, newPassword },
                        }
                        break

                    default:
                        throw new Error(`Unexpected signer name: ${signerName}`)
                }

                await this.rpcStore.rpc.changeKeyPassword(data)
            }

            this.settings.update({
                [masterKey]: { cache },
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
    oldPassword: string;
    newPassword: string;
    newPassword2: string;
    cache: boolean;
}
