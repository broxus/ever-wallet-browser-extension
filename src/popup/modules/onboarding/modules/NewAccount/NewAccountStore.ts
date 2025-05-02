import { makeAutoObservable, runInAction } from 'mobx'
import type { GeneratedMnemonic, KeyStoreEntry } from '@broxus/ever-wallet-wasm'
import { inject, singleton } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { getDefaultContractType } from '@app/shared'
import { parseError } from '@app/popup/utils'

import { ConnectionStore, LocalizationStore, Logger, NekotonToken, RpcStore } from '../../../shared'

@singleton()
export class NewAccountStore {

    public loading = false

    public error: string | undefined

    private _seed: GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
        private connectionStore: ConnectionStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get seed(): GeneratedMnemonic {
        this._seed ??= this.nekoton.generateMnemonic(
            this.nekoton.makeBip39Mnemonic({ accountId: 0, path: 'ever', entropy: 'bits128' }),
        )

        return this._seed
    }

    public async submit(accName: string, password: string): Promise<void> {
        if (this.loading) return
        this.loading = true

        let key: KeyStoreEntry | undefined
        try {
            key = await this.rpcStore.rpc.createMasterKey(
                {
                    name: this.localization.intl.formatMessage({
                        id: 'SEED',
                    }, {
                        number: 1,
                    }),
                    password,
                    seed: this.seed,
                    select: true,
                },
                undefined,
            )

            await this.rpcStore.rpc.createAccount({
                name: accName,
                publicKey: key.publicKey,
                contractType: getDefaultContractType(
                    this.connectionStore.selectedConnectionNetworkType,
                    this.connectionStore.connectionConfig,
                ),
                workchain: 0,
            }, true)
        }
        catch (e: any) {
            if (key) {
                await this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error)
            }

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
