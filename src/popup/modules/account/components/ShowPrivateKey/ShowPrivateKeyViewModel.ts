import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { LocalizationStore, RpcStore } from '@app/popup/modules/shared'
import { ignoreCheckPassword, parseError, prepareKey } from '@app/popup/utils'

@injectable()
export class ShowPrivateKeyViewModel {

    public keyEntry!: nt.KeyStoreEntry

    public keyPair: nt.KeyPair | undefined

    public loading = false

    public error = ''

    constructor(
        private rpcStore: RpcStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async onSubmit(password: string, cache: boolean): Promise<void> {
        if (this.loading) return

        this.loading = true

        try {
            const { keyEntry } = this
            const keyPassword = prepareKey({ keyEntry, password, cache })
            const isValid = ignoreCheckPassword(keyPassword) || await this.rpcStore.rpc.checkPassword(keyPassword)

            if (!isValid) {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' })
                })
                return
            }

            const keyPair = await this.rpcStore.rpc.exportKeyPair(keyPassword)
            runInAction(() => {
                this.keyPair = keyPair
            })
        }
        catch (e: any) {
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
