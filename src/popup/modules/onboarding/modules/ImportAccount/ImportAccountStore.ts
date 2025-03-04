import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import type * as nt from '@broxus/ever-wallet-wasm'

import type { Nekoton, UserMnemonic } from '@app/models'
import { parseError } from '@app/popup/utils'
import { getDefaultContractType } from '@app/shared'

import { AccountabilityStore, ConnectionStore, LocalizationStore, Logger, NekotonToken, RpcStore } from '../../../shared'

@singleton()
export class ImportAccountStore {

    public loading = false

    public error: string | undefined = undefined

    public seedError: string | undefined = undefined

    private seed: nt.GeneratedMnemonic | undefined = undefined

    private userMnemonic: UserMnemonic | undefined = undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private accountability: AccountabilityStore,
        private rpcStore: RpcStore,
        private logger: Logger,
        private connectionStore: ConnectionStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public validateMnemonic(words: string[], mnemonicType: nt.MnemonicType) {
        const phrase = words.join(' ')
        return this.nekoton.validateMnemonic(phrase, mnemonicType)
    }

    public submitSeed(words: string[], mnemonicType: nt.MnemonicType, userMnemonic?: UserMnemonic): void {
        if (this.loading) return
        this.loading = true
        this.seedError = undefined

        try {
            const phrase = words.join(' ')
            this.seed = { phrase, mnemonicType }
            this.userMnemonic = userMnemonic
            this.validateMnemonic(words, mnemonicType)
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

    public async submit(accName: string, password: string): Promise<void> {
        if (this.loading) return
        this.loading = true

        let key: nt.KeyStoreEntry | undefined
        try {
            if (!this.seed) {
                throw Error('Seed must be specified')
            }

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
                this.userMnemonic,
            )

            const accounts = await this.accountability.addExistingWallets(key.publicKey)

            if (!accounts.length) {
                await this.rpcStore.rpc.createAccount({
                    name: accName,
                    contractType: getDefaultContractType(
                        this.connectionStore.selectedConnectionNetworkType,
                    ),
                    publicKey: key.publicKey,
                    workchain: 0,
                }, true)
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
