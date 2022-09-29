import { makeAutoObservable, runInAction } from 'mobx'
import type nt from '@wallet/nekoton-wasm'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import {
    AccountabilityStore,
    createEnumField,
    NekotonToken,
    RpcStore,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { ACCOUNTS_TO_SEARCH, DEFAULT_WALLET_TYPE, Logger } from '@app/shared'

@injectable()
export class ImportAccountViewModel {

    public step = createEnumField(Step, Step.EnterPhrase)

    public loading = false

    public error: string | undefined

    private seed: nt.GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private accountability: AccountabilityStore,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<ImportAccountViewModel, any>(this, {
            nekoton: false,
            accountability: false,
            rpcStore: false,
            logger: false,
        }, { autoBind: true })
    }

    public resetError(): void {
        this.error = undefined
    }

    public submitSeed(words: string[], mnemonicType: nt.MnemonicType): void {
        const phrase = words.join(' ')

        try {
            this.loading = true
            this.nekoton.validateMnemonic(phrase, mnemonicType)
            this.seed = { phrase, mnemonicType }

            this.step.setEnterPassword()
        }
        catch (e: any) {
            this.error = parseError(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async submit(name: string, password: string): Promise<void> {
        let key: nt.KeyStoreEntry | undefined

        try {
            this.loading = true

            if (!this.seed) {
                throw Error('Seed must be specified')
            }

            key = await this.rpcStore.rpc.createMasterKey({
                password,
                seed: this.seed,
                select: true,
            })

            await this.rpcStore.rpc.createAccount({
                name,
                contractType: DEFAULT_WALLET_TYPE,
                publicKey: key.publicKey,
                workchain: 0,
            })

            await this.accountability.addExistingWallets(
                key.publicKey,
                ACCOUNTS_TO_SEARCH.filter(type => type !== DEFAULT_WALLET_TYPE),
            )

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

    public getBip39Hints(word: string): Array<string> {
        return this.nekoton.getBip39Hints(word)
    }

}

export enum Step {
    EnterPhrase,
    EnterPassword,
}
