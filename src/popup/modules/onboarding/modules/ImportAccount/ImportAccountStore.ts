import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import type * as nt from '@broxus/ever-wallet-wasm'

import type { Nekoton, NetworkType, UserMnemonic } from '@app/models'
import { parseError } from '@app/popup/utils'
import { getDefaultContractType } from '@app/shared'

import { AccountabilityStore, ConnectionStore, LocalizationStore, Logger, NekotonToken, RpcStore } from '../../../shared'

@singleton()
export class ImportAccountStore {

    public loading = false

    public error: string | undefined = undefined

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

    public validateMnemonic(words: string[], mnemonicType: nt.MnemonicType): void {
        const phrase = words.join(' ')
        return this.nekoton.validateMnemonic(phrase, mnemonicType)
    }

    public submitSeed(words: string[], mnemonicType: nt.MnemonicType, userMnemonic?: UserMnemonic): void {
        if (this.loading) return
        this.loading = true

        try {
            this.validateMnemonic(words, mnemonicType)
            const phrase = words.join(' ')
            this.seed = { phrase, mnemonicType }
            this.userMnemonic = userMnemonic
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private async importSeed(key: nt.KeyStoreEntry, password:string, name: string) {
        const rawPublicKeys = await this.rpcStore.rpc.getPublicKeys({
            type: 'master_key',
            data: {
                password,
                offset: 0,
                limit: 10,
                masterKey: key.masterKey,
            },
        })

        const paramsToCreate = rawPublicKeys.map((_, i) => ({
            accountId: i + 1,
            masterKey: key.masterKey,
            password,
        }))

        const masterAccounts = await this.accountability.addExistingWallets(key.publicKey)

        if (!masterAccounts.length) {
            await this.rpcStore.rpc.createAccount({
                name,
                contractType: getDefaultContractType(this.connectionStore.selectedConnectionNetworkType),
                publicKey: key.publicKey,
                workchain: 0,
            }, true)

            await this.rpcStore.rpc.ensureAccountSelected()

            return
        }

        for (const param of paramsToCreate) {
            const key = await this.rpcStore.rpc.createDerivedKey(param)
            const accounts = await this.accountability.addExistingWallets(key.publicKey)

            if (!accounts.length) {
                await this.rpcStore.rpc.removeKey(key)
            }
            else {
                break
            }
        }

        await this.rpcStore.rpc.ensureAccountSelected()
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

            this.importSeed(key, password, accName)
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

    public get networkType(): NetworkType {
        return this.connectionStore.selectedConnectionNetworkType
    }

}
