import { AbstractStore } from '@broxus/js-core'
import { action, computed, makeObservable, runInAction } from 'mobx'
import type { GeneratedMnemonic, KeyStoreEntry } from '@broxus/ever-wallet-wasm'
import { inject, singleton } from 'tsyringe'

import * as models from '@app/models'
import { DEFAULT_WALLET_TYPE } from '@app/shared'
import { parseError } from '@app/popup/utils'

import { Logger, NekotonToken, RpcStore } from '../../../shared'

type NewAccountStoreData = {
    _seed: GeneratedMnemonic | null
}

type NewAccountStoreState = {
    loading: boolean
    error: string | undefined

}

@singleton()
export class NewAccountStore extends AbstractStore<
    NewAccountStoreData,
    NewAccountStoreState
> {

    constructor(
        @inject(NekotonToken) private nekoton: models.Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        super()
        makeObservable(this)
    }

    @computed
    public get seed(): GeneratedMnemonic {
        if (!this._data._seed) {
            this._data._seed = this.nekoton.generateMnemonic(
                this.nekoton.makeLabsMnemonic(0),
            )
        }

        return this._data._seed
    }

    @action.bound
    public async submit(name: string, password: string): Promise<void> {
        let key: KeyStoreEntry | undefined
        try {
            this.setState('loading', true)

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

            // this.onSuccess()
        }
        catch (e: any) {
            if (key) {
                await this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error)
            }

            runInAction(() => {
                this.setState('error', parseError(e))
            })
        }
        finally {
            runInAction(() => {
                this.setState('loading', false)
            })
        }
    }


}
