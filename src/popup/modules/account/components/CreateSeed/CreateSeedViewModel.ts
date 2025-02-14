import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { ChangeEvent } from 'react'
import { inject, injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import { AccountabilityStore, createEnumField, LocalizationStore, NekotonToken, NotificationStore, Router, RpcStore, ConnectionStore } from '@app/popup/modules/shared'
import type { Nekoton } from '@app/models'
import { getDefaultContractType } from '@app/shared/contracts'

@injectable()
export class CreateSeedViewModel {

    public name: string | undefined

    public loading = false

    public error = ''

    public flow = AddSeedFlow.Create

    public step = createEnumField<typeof Step>(Step.Index)

    private _seed: nt.GeneratedMnemonic | null = null

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.name = localization.intl.formatMessage({ id: 'SEED' }, { number: this.accountability.masterKeys.length + 1 })
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

    public get countSeeds(): number {
        return this.accountability.masterKeys.length
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

            if (this.flow === AddSeedFlow.Import
                || this.flow === AddSeedFlow.ImportLegacy || this.flow === AddSeedFlow.Create) {
                const accounts = await this.accountability.addExistingWallets(key.publicKey)

                const keyIndex = this.accountability.selectedMasterKey
                    ? Math.max(
                        0,
                        this.accountability.masterKeys.findIndex(item => item.masterKey
                            === this.accountability.selectedMasterKey),
                    )
                    : 0

                const accountName = this.localization.intl.formatMessage(
                    { id: 'ACCOUNT_GENERATED_NAME' },
                    { accountId: keyIndex + 1, number: 1 },
                )


                if (!accounts.length) {
                    await this.rpcStore.rpc.createAccount({
                        name: this.flow === AddSeedFlow.Create ? accountName : key.name,
                        contractType: getDefaultContractType(this.connectionStore.selectedConnectionNetworkType),
                        publicKey: key.publicKey,
                        workchain: 0,
                    }, true)
                }

                await this.rpcStore.rpc.ensureAccountSelected()
            }

            this.accountability.onManageMasterKey(key)
            this.accountability.onManageDerivedKey(key)

            await this.router.navigate('../../seed')
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
                this.step.setValue(Step.CheckPhrase)
                break

            case Step.CheckPhrase:
                this.step.setValue(Step.PasswordRequest)
                break

            default:
                if (this.flow === AddSeedFlow.Create) {
                    this.step.setValue(Step.ShowPhrase)
                }
                else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
                    this.step.setValue(Step.ImportPhrase)
                }
                else if (this.flow === AddSeedFlow.ConnectLedger) {
                    this.step.setValue(Step.ConnectLedger)
                }
        }
    }

    public onImportSubmit(words: string[]): void {
        const phrase = words.join(' ')
        const mnemonicType: nt.MnemonicType = this.flow === AddSeedFlow.ImportLegacy
            ? { type: 'legacy' }
            : { type: 'labs', accountId: 0 }

        try {
            this.nekoton.validateMnemonic(phrase, mnemonicType)
            this._seed = { phrase, mnemonicType }
            this.step.setValue(Step.PasswordRequest)
        }
        catch (e: any) {
            this.notification.error(
                this.localization.intl.formatMessage({ id: 'THE_SEED_WRONG' }),
            )
        }
    }

    public onBack(): void {
        this.error = ''

        switch (this.step.value) {
            case Step.ShowPhrase:
            case Step.ImportPhrase:
                this.step.setValue(Step.Index)
                break

            case Step.CheckPhrase:
                this.step.setValue(Step.ShowPhrase)
                break

            case Step.PasswordRequest:
                if (this.flow === AddSeedFlow.Create) {
                    this.step.setValue(Step.ShowPhrase)
                }
                else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
                    this.step.setValue(Step.ImportPhrase)
                }
                else if (this.flow === AddSeedFlow.ConnectLedger) {
                    this.step.setValue(Step.ConnectLedger)
                }
                break

            default:
                this.step.setValue(Step.Index)
                break
        }
    }

    public getBip39Hints(word: string): string[] {
        return this.nekoton.getBip39Hints(word)
    }

    public onLedgerSuccess() {
        this.rpcStore.rpc.sendEvent({
            type: 'close-modals',
            data: {},
        })
        window.close()
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
