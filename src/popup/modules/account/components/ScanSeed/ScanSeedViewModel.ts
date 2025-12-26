import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, LocalizationStore, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'
import { KeyToDerive } from '@app/models'


type CreateKeyToDerive = KeyToDerive & {
    publicKey: string
}

@injectable()
export class ScanSeedViewModel {

    public loading = false

    public error = ''

    constructor(
        public panel: SlidingPanelHandle,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }


    public async scanSeed({ password } : { password: string }) {
        this.loading = true
        try {
            const key = this.accountability.currentMasterKey!
            const keys = new Set(this.accountability.keysByMasterKey[key.masterKey].map((el) => el.publicKey))

            const rawPublicKeys = key.signerName === 'encrypted_key' ? [key.publicKey] : await this.rpcStore.rpc.getPublicKeys({
                type: 'master_key',
                data: {
                    password,
                    offset: 0,
                    limit: 10,
                    masterKey: key.masterKey,
                },
            })

            const paramsToCreate = rawPublicKeys.reduce((acc, publicKey, i) => {
                acc.push({
                    accountId: i,
                    masterKey: key.masterKey,
                    password,
                    publicKey,
                })
                return acc
            }, [] as CreateKeyToDerive[])

            for (const { publicKey, ...param } of paramsToCreate) {
                let key = publicKey
                if (!keys.has(publicKey)) {
                    key = (await this.rpcStore.rpc.createDerivedKey(param)).publicKey
                }

                const accounts = await this.accountability.addExistingWallets(key)

                if (!accounts.length && !this.accountability.accountsByPublicKey[key]) {
                    await this.rpcStore.rpc.removeKey({ publicKey: key })
                    break
                }
            }

            runInAction(() => {
                this.panel.close()
                this.loading = false
            })
        }
        catch (e) {
            console.log(e, 'scan seed error')
            runInAction(() => {
                this.loading = false
                this.error = this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' })
            })
        }
    }

}
