import { AccountToAdd } from '@wallet/nekoton-wasm'
import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { ChangeEvent } from 'react'
import { inject, injectable } from 'tsyringe'

import { Logger } from '@app/shared'
import { parseError } from '@app/popup/utils'
import {
    AccountabilityStep,
    AccountabilityStore,
    CONTRACT_TYPE_NAMES,
    CONTRACT_TYPES_KEYS,
    createEnumField,
    NekotonToken,
    RpcStore,
} from '@app/popup/modules/shared'
import { Nekoton } from '@app/models'

@injectable()
export class CreateSeedViewModel {

    public name: string | undefined

    public loading = false

    public error = ''

    public flow = AddSeedFlow.Create

    public step = createEnumField(Step, Step.Index)

    private _seed: nt.GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable<CreateSeedViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
            logger: false,
        }, { autoBind: true })
    }

    public get seed(): nt.GeneratedMnemonic {
        if (!this._seed) {
            this._seed = this.nekoton.generateMnemonic(
                this.nekoton.makeLabsMnemonic(0),
            )
        }

        return this._seed
    }

    public get seedWords(): string[] {
        return this.seed.phrase.split(' ')
    }

    public onNameChange(e: ChangeEvent<HTMLInputElement>): void {
        this.name = e.target.value
    }

    public onFlowChange(value: AddSeedFlow): void {
        this.flow = value
    }

    public async onSubmit(password: string): Promise<void> {
        this.loading = true

        try {
            let nameToSave = this.name?.trim()
            if (nameToSave?.length === 0) {
                nameToSave = undefined
            }

            const key = await this.rpcStore.rpc.createMasterKey({
                select: false,
                seed: this.seed,
                name: nameToSave,
                password,
            })

            await this.addExistingWallets(key.publicKey)

            this.accountability.onManageMasterKey(key)
            this.accountability.onManageDerivedKey(key)
        }
        catch (e: any) {
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

    public onNext(): void {
        switch (this.step.value) {
            case Step.ShowPhrase:
                this.step.setCheckPhrase()
                break

            case Step.CheckPhrase:
                this.step.setPasswordRequest()
                break

            default:
                if (this.flow === AddSeedFlow.Create) {
                    this.step.setShowPhrase()
                }
                else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
                    this.step.setImportPhrase()
                }
                else if (this.flow === AddSeedFlow.ConnectLedger) {
                    this.step.setConnectLedger()
                }
        }
    }

    public onNextWhenImport(words: string[]): void {
        const phrase = words.join(' ')
        const mnemonicType: nt.MnemonicType = this.flow === AddSeedFlow.ImportLegacy
            ? { type: 'legacy' }
            : { type: 'labs', accountId: 0 }

        try {
            this.nekoton.validateMnemonic(phrase, mnemonicType)
            this._seed = { phrase, mnemonicType }
            this.step.setPasswordRequest()
        }
        catch (e: any) {
            this.error = parseError(e)
        }
    }

    public onBack(): void {
        this.error = ''

        switch (this.step.value) {
            case Step.ShowPhrase:
            case Step.ImportPhrase:
                this.step.setIndex()
                break

            case Step.CheckPhrase:
                this.step.setShowPhrase()
                break

            case Step.PasswordRequest:
                if (this.flow === AddSeedFlow.Create) {
                    this.step.setShowPhrase()
                }
                else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
                    this.step.setImportPhrase()
                }
                else if (this.flow === AddSeedFlow.ConnectLedger) {
                    this.step.setConnectLedger()
                }
                break

            default:
                this.accountability.setStep(AccountabilityStep.MANAGE_SEEDS)
                break
        }
    }

    public getBip39Hints(word: string): string[] {
        return this.nekoton.getBip39Hints(word)
    }

    private async addExistingWallets(publicKey: string): Promise<void> {
        try {
            const existingWallets = await this.rpcStore.rpc.findExistingWallets({
                publicKey,
                contractTypes: CONTRACT_TYPES_KEYS,
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

export enum AddSeedFlow {
    Create,
    Import,
    ImportLegacy,
    ConnectLedger,
}

export enum Step {
    Index,
    ShowPhrase,
    CheckPhrase,
    PasswordRequest,
    ImportPhrase,
    ConnectLedger,
}

export interface OptionType {
    key: AddSeedFlow;
    value: AddSeedFlow;
    label: string;
}
