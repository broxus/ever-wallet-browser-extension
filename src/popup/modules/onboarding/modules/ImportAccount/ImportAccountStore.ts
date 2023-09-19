import { AbstractStore } from '@broxus/js-core'
import { action, computed, makeObservable } from 'mobx'
import { inject, singleton } from 'tsyringe'
import type * as nt from '@broxus/ever-wallet-wasm'

import * as models from '@app/models'
import { parseError } from '@app/popup/utils'
import { DEFAULT_WALLET_TYPE } from '@app/shared'

import { AccountabilityStore, Logger, NekotonToken, RpcStore } from '../../../shared'

type ImportAccountStoreData = {
    error: string | undefined
    seedError: string | undefined
    seed: nt.GeneratedMnemonic | null
}

type ImportAccountStoreState = {
    onSuccess: () => void
    loading: boolean
}

@singleton()
export class ImportAccountStore extends AbstractStore<
    ImportAccountStoreData,
    ImportAccountStoreState
> {

    constructor(
        @inject(NekotonToken) private nekoton: models.Nekoton,
        private accountability: AccountabilityStore,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        super()
        makeObservable(this)
    }

    @computed
    public get seed(): nt.GeneratedMnemonic | undefined {
        if (this._data.seed) {
            return this._data.seed
        }
        return undefined

    }

    @action.bound
    public resetError(): void {
        this.setData('error', undefined)
    }

    @action.bound
    public getBip39Hints(word: string): Array<string> {
        return this.nekoton.getBip39Hints(word)
    }

    @action.bound
    public submitSeed(words: string[], mnemonicType: nt.MnemonicType): void {
        const phrase = words.join(' ')
        try {
            this.setState('loading', true)
            this.setData('seedError', undefined)
            this.setData('seed', { phrase, mnemonicType })

            this.nekoton.validateMnemonic(phrase, mnemonicType)
        }
        catch (e: any) {
            this.setData('seedError', parseError(e))
        }
        finally {
            this.setState('loading', false)
        }
    }

    @action.bound
    public async submit(name: string, password: string): Promise<void> {
        let key: nt.KeyStoreEntry | undefined
        try {
            this.setState('loading', true)
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
                    contractType: DEFAULT_WALLET_TYPE,
                    publicKey: key.publicKey,
                    workchain: 0,
                })
            }

            await this.rpcStore.rpc.ensureAccountSelected()

            this._state.onSuccess()
        }
        catch (e: any) {
            if (key) {
                await this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error)
            }
            this.setData('error', parseError(e))
        }
        finally {
            this.setState('loading', false)
        }
    }

}
