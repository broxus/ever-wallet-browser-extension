import { makeAutoObservable, runInAction } from 'mobx'
import type { GeneratedMnemonic, KeyStoreEntry } from '@broxus/ever-wallet-wasm'
import { inject, singleton } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { DEFAULT_WALLET_TYPE } from '@app/shared'
import { parseError } from '@app/popup/utils'

import { Logger, NekotonToken, RpcStore } from '../../../shared'

@singleton()
export class NewAccountStore {

    public loading = false

    public error: string | undefined

    private _seed: GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get seed(): GeneratedMnemonic {
        this._seed ??= this.nekoton.generateMnemonic(
            this.nekoton.makeLabsMnemonic(0),
        )

        return this._seed
    }

    public async submit(name: string, password: string): Promise<void> {
        if (this.loading) return
        this.loading = true

        let key: KeyStoreEntry | undefined
        try {
            key = await this.rpcStore.rpc.createMasterKey({
                password,
                seed: this.seed,
                select: true,
            })

            await this.rpcStore.rpc.createAccount({
                name,
                publicKey: key.publicKey,
                contractType: DEFAULT_WALLET_TYPE,
                workchain: 0,
            })
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
