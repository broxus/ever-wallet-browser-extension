import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import type * as nt from '@broxus/ever-wallet-wasm'

import type { Nekoton } from '@app/models'
import { parseError } from '@app/popup/utils'
import { getDefaultContractType } from '@app/shared'

import { AccountabilityStore, ConnectionStore, Logger, NekotonToken, RpcStore } from '../../../shared'

@singleton()
export class ImportAccountStore {

    public loading = false

    public error: string | undefined

    public seedError: string | undefined

    private seed: nt.GeneratedMnemonic | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private accountability: AccountabilityStore,
        private rpcStore: RpcStore,
        private logger: Logger,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public submitSeed(words: string[], mnemonicType: nt.MnemonicType): void {
        if (this.loading) return
        this.loading = true
        this.seedError = undefined

        try {
            const phrase = words.join(' ')
            this.seed = { phrase, mnemonicType }

            this.nekoton.validateMnemonic(phrase, mnemonicType)
        }
        catch (e: any) {
            runInAction(() => {
                this.seedError = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async submit(name: string, password: string): Promise<void> {
        if (this.loading) return
        this.loading = true

        let key: nt.KeyStoreEntry | undefined
        try {
            if (!this.seed) {
                throw Error('Seed must be specified')
            }
            key = await this.rpcStore.rpc.createMasterKey({
                password,
                seed: this.seed,
                select: true,
            })

            const accounts = await this.accountability.addExistingWallets(key.publicKey)

            if (!accounts.length) {
                await this.rpcStore.rpc.createAccount({
                    name,
                    contractType: getDefaultContractType(
                        this.connectionStore.selectedConnectionNetworkType,
                    ),
                    publicKey: key.publicKey,
                    workchain: 0,
                })
            }

            await this.rpcStore.rpc.ensureAccountSelected()
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
