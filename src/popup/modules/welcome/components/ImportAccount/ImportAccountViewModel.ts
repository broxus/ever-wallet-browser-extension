import { AccountToAdd } from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import type {
    ContractType, GeneratedMnemonic, KeyStoreEntry, MnemonicType,
} from '@wallet/nekoton-wasm'
import { inject, injectable } from 'tsyringe'

import { Nekoton } from '@app/models'
import {
    CONTRACT_TYPE_NAMES,
    CONTRACT_TYPES_KEYS,
    createEnumField,
    NekotonToken,
    RpcStore,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { DEFAULT_CONTRACT_TYPE, Logger } from '@app/shared'

@injectable()
export class ImportAccountViewModel {

    public step = createEnumField(Step, Step.SelectContractType)

    public contractType = DEFAULT_CONTRACT_TYPE

    public loading = false

    public error: string | undefined

    private seed: GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<ImportAccountViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            logger: false,
        }, { autoBind: true })
    }

    public get wordCount(): number {
        return this.contractType === 'WalletV3' ? 24 : 12
    }

    public setContractType(type: ContractType): void {
        this.contractType = type
        this.step.setEnterPhrase()
    }

    public resetError(): void {
        this.error = undefined
    }

    public submitSeed(words: string[]): void {
        const phrase = words.join(' ')
        const mnemonicType: MnemonicType = this.contractType === 'WalletV3' ? { type: 'legacy' } : {
            type: 'labs',
            accountId: 0,
        }

        try {
            this.nekoton.validateMnemonic(phrase, mnemonicType)
            this.seed = { phrase, mnemonicType }

            this.step.setEnterPassword()
        }
        catch (e: any) {
            this.error = parseError(e)
        }
    }

    public async submit(name: string, password: string): Promise<void> {
        let key: KeyStoreEntry | undefined

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
                contractType: this.contractType,
                publicKey: key.publicKey,
                workchain: 0,
            })

            await this.addExistingWallets(key.publicKey)

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

    private async addExistingWallets(publicKey: string): Promise<void> {
        try {
            const existingWallets = await this.rpcStore.rpc.findExistingWallets({
                publicKey,
                contractTypes: CONTRACT_TYPES_KEYS.filter(type => type !== this.contractType),
                workchainId: 0,
            })
            const accountsToAdd = existingWallets
                .filter(wallet => wallet.contractState.isDeployed || wallet.contractState.balance !== '0')
                .map<AccountToAdd>(wallet => ({
                    name: CONTRACT_TYPE_NAMES[wallet.contractType],
                    publicKey: wallet.publicKey,
                    contractType: wallet.contractType,
                    workchain: 0,
                }))

            if (accountsToAdd.length) {
                await this.rpcStore.rpc.createAccounts(accountsToAdd)
            }
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}

export enum Step {
    SelectContractType,
    EnterPhrase,
    EnterPassword,
}
