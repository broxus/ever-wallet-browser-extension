import { makeAutoObservable, runInAction } from 'mobx'
import type { GeneratedMnemonic, KeyStoreEntry } from '@broxus/ever-wallet-wasm'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { ConnectionStore, createEnumField, Logger, NekotonToken, RpcStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { getDefaultContractType } from '@app/shared'

@injectable()
export class NewAccountViewModel {

    public onSuccess!: () => void

    public step = createEnumField<typeof Step>(Step.ShowPhrase)

    public loading = false

    public error: string | undefined

    private _seed: GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get seed(): GeneratedMnemonic {
        if (!this._seed) {
            this._seed = this.nekoton.generateMnemonic(
                this.nekoton.makeBip39Mnemonic({ accountId: 0, path: 'ever', entropy: 'bits128' }),
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
                contractType: getDefaultContractType(
                    this.connectionStore.selectedConnectionNetworkType,
                ),
                workchain: 0,
            })

            this.onSuccess()
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

    public getBip39Hints(word: string): string[] {
        return this.nekoton.getBip39Hints(word)
    }

}

export enum Step {
    ShowPhrase,
    CheckPhrase,
    EnterPassword,
}
