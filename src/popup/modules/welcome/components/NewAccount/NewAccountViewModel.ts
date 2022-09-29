import { makeAutoObservable, runInAction } from 'mobx'
import type { GeneratedMnemonic, KeyStoreEntry } from '@wallet/nekoton-wasm'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { createEnumField, NekotonToken, RpcStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { DEFAULT_WALLET_TYPE, Logger } from '@app/shared'

@injectable()
export class NewAccountViewModel {

    public step = createEnumField(Step, Step.ShowPhrase)

    public loading = false

    public error: string | undefined

    private _seed: GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NewAccountViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            logger: false,
        }, { autoBind: true })
    }

    public get seed(): GeneratedMnemonic {
        if (!this._seed) {
            this._seed = this.nekoton.generateMnemonic(
                this.nekoton.makeLabsMnemonic(0),
            )
        }

        return this._seed
    }

    public resetError(): void {
        this.error = undefined
    }

    public async submit(name: string, password: string): Promise<void> {
        let key: KeyStoreEntry | undefined

        try {
            this.loading = true

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

            window.close()
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

export enum Step {
    ShowPhrase,
    CheckPhrase,
    EnterPassword,
}
