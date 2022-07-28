import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { ChangeEvent } from 'react'
import { inject, injectable } from 'tsyringe'

import { Nekoton } from '@app/models'
import {
    AccountabilityStep,
    AccountabilityStore,
    CONTRACT_TYPES_KEYS,
    createEnumField,
    DrawerContext,
    LocalizationStore,
    NekotonToken,
    Panel,
    RpcStore,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { DEFAULT_CONTRACT_TYPE, Logger } from '@app/shared'

import { AddAccountFlow } from '../../models'

@injectable()
export class CreateAccountViewModel {

    public drawer!: DrawerContext

    public step = createEnumField(Step, Step.Index)

    public contractType = DEFAULT_CONTRACT_TYPE

    public flow = AddAccountFlow.CREATE

    public loading = false

    public address = ''

    public error = ''

    private _name: string | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable<CreateAccountViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
            localizationStore: false,
            logger: false,
        }, { autoBind: true })

        if (!this.accountability.currentDerivedKey && this.accountability.derivedKeys[0]) {
            runInAction(() => {
                this.setCurrentDerivedKey(this.accountability.derivedKeys[0])
            })
        }

        if (!this.availableContracts.includes(this.contractType) || !this.contractType) {
            runInAction(() => {
                // eslint-disable-next-line prefer-destructuring
                this.contractType = this.availableContracts[0]
            })
        }
    }

    public get name(): string {
        return typeof this._name !== 'undefined' ? this._name : this.defaultAccountName
    }

    public get defaultAccountName() {
        const accountId = this.accountability.currentDerivedKey?.accountId || 0
        const number = this.accountability.currentDerivedKeyAccounts.length
        return this.localization.intl.formatMessage(
            { id: 'ACCOUNT_GENERATED_NAME' },
            { accountId: accountId + 1, number: number + 1 },
        )
    }

    public get derivedKeys(): nt.KeyStoreEntry[] {
        return this.accountability.derivedKeys
    }

    public get currentDerivedKey(): nt.KeyStoreEntry {
        return this.accountability.currentDerivedKey ?? this.derivedKeys[0]
    }

    public get availableContracts(): nt.ContractType[] {
        const { currentDerivedKey } = this.accountability

        if (!currentDerivedKey) {
            return CONTRACT_TYPES_KEYS
        }

        const accountAddresses = this.accountability.currentDerivedKeyAccounts.map(
            account => account.tonWallet.address,
        )

        return CONTRACT_TYPES_KEYS.filter(type => {
            const address = this.nekoton.computeTonWalletAddress(currentDerivedKey.publicKey, type, 0)
            return !accountAddresses.includes(address)
        })
    }

    public setCurrentDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.setCurrentDerivedKey(key)
        this._name = undefined
    }

    public setFlow(flow: AddAccountFlow): void {
        this.flow = flow
    }

    public setContractType(value: nt.ContractType): void {
        this.contractType = value
    }

    public onAddressChange(e: ChangeEvent<HTMLInputElement>): void {
        this.address = e.target.value
    }

    public onNameChange(e: ChangeEvent<HTMLInputElement>): void {
        this._name = e.target.value
    }

    public onManageDerivedKey(): void {
        this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY)
        this.drawer.setPanel(Panel.ACCOUNTS_MANAGER)
    }

    public async onSubmit(): Promise<void> {
        if (!this.accountability.currentDerivedKey || this.loading) return

        this.loading = true

        try {
            const account = await this.rpcStore.rpc.createAccount({
                contractType: this.contractType,
                name: this.name,
                publicKey: this.accountability.currentDerivedKey.publicKey,
                workchain: 0,
            })

            if (account) {
                this.manageAccount(account)
            }
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

    public async onAddExisting(): Promise<void> {
        if (!this.accountability.currentDerivedKey) return

        this.loading = true

        try {
            const data = await this.rpcStore.rpc.getEverWalletInitData(this.address)
            const { publicKey, contractType, workchain, custodians } = data

            if (!this.accountability.currentDerivedKey) return

            const currentPublicKey = this.accountability.currentDerivedKey.publicKey

            if (publicKey === currentPublicKey) {
                const hasAccount = this.accountability.currentDerivedKeyAccounts.some(
                    account => account.tonWallet.address === this.address,
                )

                if (!hasAccount) {
                    this.manageAccount(
                        await this.createAccount(contractType, publicKey, workchain),
                    )

                    this.logger.log('[CreateAccountViewModel] address not found in derived key -> create')
                }
                else {
                    // TODO: ?
                    // setError();
                }
            }
            else if (custodians.includes(currentPublicKey)) {
                const existingAccount = this.accountability.accountEntries[this.address] as nt.AssetsList | undefined

                if (!existingAccount) {
                    await this.rpcStore.rpc.addExternalAccount(this.address, publicKey, currentPublicKey)

                    this.manageAccount(
                        await this.createAccount(contractType, publicKey, workchain),
                    )

                    this.logger.log('[CreateAccountViewModel] create and add account to externals')
                }
                else {
                    await this.rpcStore.rpc.addExternalAccount(this.address, publicKey, currentPublicKey)
                    await this.rpcStore.rpc.updateAccountVisibility(this.address, true)

                    this.manageAccount(existingAccount)

                    this.logger.log('[CreateAccountViewModel] add to externals')
                }
            }
            else {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({
                        id: 'CREATE_ACCOUNT_PANEL_ACCOUNT_EXISTS_ERROR',
                    })
                })
            }
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
            case Step.Index:
                if (this.flow === AddAccountFlow.CREATE) {
                    this.step.setEnterName()
                }
                else if (this.flow === AddAccountFlow.IMPORT) {
                    this.step.setEnterAddress()
                }
                break

            case Step.EnterName:
                this.step.setSelectContractType()
                break

            default: break
        }
    }

    public onBack(): void {
        switch (this.step.value) {
            case Step.EnterName:
            case Step.EnterAddress:
                this.error = ''
                this.step.setIndex()
                break

            case Step.SelectContractType:
                if (this.flow === AddAccountFlow.CREATE) {
                    this.step.setEnterName()
                }
                else if (this.flow === AddAccountFlow.IMPORT) {
                    this.step.setEnterAddress()
                }
                break

            default:
                this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY)
                break
        }
    }

    private manageAccount(account: nt.AssetsList) {
        this.drawer.setPanel(Panel.ACCOUNTS_MANAGER)
        this.accountability.onManageAccount(account)
    }

    private createAccount(
        contractType: nt.ContractType,
        publicKey: string,
        workchain: number,
    ): Promise<nt.AssetsList> {
        const { name } = this
        const explicitAddress = this.address

        return this.rpcStore.rpc.createAccount({ contractType, publicKey, workchain, name, explicitAddress })
    }

}

export enum Step {
    Index,
    EnterAddress,
    EnterName,
    SelectContractType,
}
