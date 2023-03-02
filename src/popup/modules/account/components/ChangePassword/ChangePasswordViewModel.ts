import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class ChangePasswordViewModel {

    public loading = false

    public visibility = [false, false, false]

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public async submit(key: nt.KeyStoreEntry, { oldPassword, newPassword }: FormValue) {
        if (this.loading) return

        this.loading = true

        try {
            let data: nt.ChangeKeyPassword

            switch (key.signerName) {
                case 'master_key':
                    data = {
                        type: 'master_key',
                        data: { masterKey: key.masterKey, oldPassword, newPassword },
                    }
                    break
                case 'encrypted_key':
                    data = {
                        type: 'encrypted_key',
                        data: { publicKey: key.publicKey, oldPassword, newPassword },
                    }
                    break

                default:
                    throw new Error(`Unexpected signer name: ${key.signerName}`)
            }

            await this.rpcStore.rpc.changeKeyPassword(data)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public toggleVisibility(index: number): void {
        this.visibility[index] = !this.visibility[index]
    }

}

export interface FormValue {
    oldPassword: string;
    newPassword: string;
    newPassword2: string;
}
