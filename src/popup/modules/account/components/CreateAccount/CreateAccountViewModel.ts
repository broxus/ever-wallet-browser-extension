import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { ChangeEvent } from 'react'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import {
    AccountabilityStep,
    AccountabilityStore, ConnectionStore,
    createEnumField,
    Drawer,
    LocalizationStore,
    Logger,
    NekotonToken,
    Panel,
    RpcStore,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { ContractEntry, getContractTypes, getDefaultContractType, getDefaultWalletContracts, getOtherWalletContracts, isNativeAddress } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

import { AddAccountFlow } from '../../models'

@injectable()
export class CreateAccountViewModel {

    public step = createEnumField<typeof Step>(Step.Index)

    public contractType = getDefaultContractType(
        this.connectionStore.selectedConnectionNetworkType,
    )

    public flow = AddAccountFlow.CREATE

    public loading = false

    public address = ''

    public error = ''

    private _name: string | undefined

    constructor(
        public drawer: Drawer,
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private contactsStore: ContactsStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        if (!this.accountability.currentDerivedKey && this.accountability.derivedKeys[0]) {
            runInAction(() => {
                this.setCurrentDerivedKey(this.accountability.derivedKeys[0])
            })
        }

        if (!this.availableContracts.includes(this.contractType) || !this.contractType) {
            runInAction(() => {
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

    public get defaultContracts(): ContractEntry[] {
        return getDefaultWalletContracts(
            this.connectionStore.selectedConnectionNetworkType,
        )
    }

    public get otherContracts(): ContractEntry[] {
        return getOtherWalletContracts(
            this.connectionStore.selectedConnectionNetworkType,
        )
    }

    public get availableContracts(): nt.ContractType[] {
        const { currentDerivedKey } = this.accountability
        const contractTypes = getContractTypes(
            this.connectionStore.selectedConnectionNetworkType,
        )

        if (!currentDerivedKey) {
            return contractTypes
        }

        const accountAddresses = new Set(
            this.accountability.currentDerivedKeyAccounts.map(
                account => account.tonWallet.address,
            ),
        )

        return contractTypes.filter(type => {
            const address = this.nekoton.computeTonWalletAddress(currentDerivedKey.publicKey, type, 0)
            return !accountAddresses.has(address)
        })
    }

    public setCurrentDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.setCurrentDerivedKey(key)
        this._name = undefined
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
            const { currentDerivedKey, currentDerivedKeyAccounts, accountEntries } = this.accountability
            const { address } = await this.contactsStore.resolveAddress(this.address)

            if (!address) {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({
                        id: 'ERROR_INVALID_ADDRESS',
                    })
                })
                return
            }

            const data = await this.rpcStore.rpc.getEverWalletInitData(address)
            const { publicKey, contractType, workchain, custodians } = data

            const currentPublicKey = currentDerivedKey.publicKey

            if (publicKey === currentPublicKey) {
                const hasAccount = currentDerivedKeyAccounts.some(
                    account => account.tonWallet.address === address,
                )

                if (!hasAccount) {
                    this.manageAccount(
                        await this.createAccount(contractType, publicKey, workchain, address),
                    )

                    this.logger.log('[CreateAccountViewModel] address not found in derived key -> create')
                }
                else {
                    runInAction(() => {
                        this.error = this.localization.intl.formatMessage({
                            id: 'CREATE_ACCOUNT_PANEL_ACCOUNT_EXISTS_ERROR',
                        })
                    })
                }
            }
            else if (custodians.includes(currentPublicKey)) {
                const existingAccount = accountEntries[address] as nt.AssetsList | undefined

                if (!existingAccount) {
                    await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)

                    this.manageAccount(
                        await this.createAccount(contractType, publicKey, workchain, address),
                    )

                    this.logger.log('[CreateAccountViewModel] create and add account to externals')
                }
                else {
                    await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)
                    await this.rpcStore.rpc.updateAccountVisibility(address, true)

                    this.manageAccount(existingAccount)

                    this.logger.log('[CreateAccountViewModel] add to externals')
                }
            }
            else {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({
                        id: 'CREATE_ACCOUNT_PANEL_NOT_CUSTODIAN_ERROR',
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

    public onFlow(flow: AddAccountFlow): void {
        this.flow = flow

        if (this.flow === AddAccountFlow.CREATE) {
            this.step.setValue(Step.EnterName)
        }
        else if (this.flow === AddAccountFlow.IMPORT) {
            this.step.setValue(Step.EnterAddress)
        }
    }

    public onNext(): void {
        this.step.setValue(Step.SelectContractType)
    }

    public onBack(): void {
        switch (this.step.value) {
            case Step.EnterName:
            case Step.EnterAddress:
                this.error = ''
                this.step.setValue(Step.Index)
                break

            case Step.SelectContractType:
                if (this.flow === AddAccountFlow.CREATE) {
                    this.step.setValue(Step.EnterName)
                }
                else if (this.flow === AddAccountFlow.IMPORT) {
                    this.step.setValue(Step.EnterAddress)
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
        explicitAddress?: string,
    ): Promise<nt.AssetsList> {
        const { name } = this

        return this.rpcStore.rpc.createAccount({ contractType, publicKey, workchain, name, explicitAddress })
    }

}

export enum Step {
    Index,
    EnterAddress,
    EnterName,
    SelectContractType,
}
