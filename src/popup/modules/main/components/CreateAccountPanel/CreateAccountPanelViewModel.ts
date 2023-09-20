import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { AccountabilityStore, createEnumField, LocalizationStore, Logger, NekotonToken, NotificationStore, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'
import { getScrollWidth, parseError } from '@app/popup/utils'
import { closeCurrentWindow, isNativeAddress } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { AddAccountFlow } from '@app/popup/modules/account'
import { LedgerUtils } from '@app/popup/modules/ledger'

import { AddAccountFormValue, AddExternalFormValue } from './components'

@injectable()
export class CreateAccountPanelViewModel {

    public step = createEnumField<typeof Step>(Step.Index)

    public flow = AddAccountFlow.CREATE

    public loading = false

    public error = ''

    public name = ''

    public password = ''

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private contactsStore: ContactsStore,
        private logger: Logger,
        private handle: SlidingPanelHandle,
        private ledger: LedgerUtils,
        private notification: NotificationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        const masterKey = this.accountability.masterKeys.find(
            key => key.masterKey === this.accountability.selectedMasterKey,
        )

        this.accountability.setCurrentMasterKey(masterKey)
        this.accountability.setCurrentDerivedKey(this.accountability.derivedKeys[0])
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

    public get accountsByKey(): Record<string, nt.AssetsList[] | undefined> {
        return Object.values(this.accountability.accountEntries).reduce((result, account) => {
            if (!result[account.tonWallet.publicKey]) {
                result[account.tonWallet.publicKey] = []
            }
            result[account.tonWallet.publicKey].push(account)
            return result
        }, {} as Record<string, nt.AssetsList[]>)
    }

    public setCurrentDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.setCurrentDerivedKey(key)
    }

    public async onSubmit(contractType: nt.ContractType): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            const { derivedKeys, currentDerivedKey } = this
            const key = await this.getAvailablePublicKey(contractType)
            const hasDerivedKey = derivedKeys.some(({ publicKey }) => publicKey === key.publicKey)

            if (!hasDerivedKey) {
                // create derived key
                if (currentDerivedKey.signerName === 'ledger_key') {
                    await this.rpcStore.rpc.createLedgerKey({ accountId: key.index })
                }
                else {
                    await this.rpcStore.rpc.createDerivedKey({
                        accountId: key.index,
                        masterKey: currentDerivedKey.masterKey,
                        password: this.password,
                    })
                }
            }

            // create account
            const account = await this.rpcStore.rpc.createAccount({
                contractType,
                name: this.name,
                publicKey: key.publicKey,
                workchain: 0,
            })

            await this.accountability.selectAccount(account.tonWallet.address)
            this.handle.close()
        }
        catch (e: any) {
            this.notification.error(parseError(e))
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async onAddAccount({ name, password }: AddAccountFormValue): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            if (this.currentDerivedKey.signerName === 'ledger_key') {
                const connected = await this.ledger.checkLedger()
                if (!connected) {
                    await this.connectLedger()
                    return
                }

                const found = await this.ledger.checkLedgerMasterKey(this.currentDerivedKey)
                if (!found) {
                    this.notification.error(this.localization.intl.formatMessage({ id: 'ERROR_LEDGER_KEY_NOT_FOUND' }))
                    return
                }
            }
            else {
                await this.rpcStore.rpc.getPublicKeys({
                    type: 'master_key',
                    data: {
                        password,
                        offset: 0,
                        limit: 1,
                        masterKey: this.currentDerivedKey.masterKey,
                    },
                })
            }

            runInAction(() => {
                this.name = name
                this.password = password
                this.step.setValue(Step.SelectContractType)
            })
        }
        catch (e: any) {
            runInAction(() => {
                this.error = this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' })
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async onAddExisting(value: AddExternalFormValue): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            const { currentDerivedKey } = this
            const { currentDerivedKeyAccounts, accountEntries } = this.accountability
            let address: string | null = value.address

            if (!this.nekoton.checkAddress(address) && !isNativeAddress(address)) {
                address = await this.contactsStore.resolveDensPath(address)

                if (!address) {
                    runInAction(() => {
                        this.error = this.localization.intl.formatMessage({
                            id: 'ERROR_INVALID_ADDRESS',
                        })
                    })
                    return
                }
            }

            const data = await this.rpcStore.rpc.getEverWalletInitData(address)
            const { publicKey, contractType, workchain, custodians } = data

            const currentPublicKey = currentDerivedKey.publicKey

            if (publicKey === currentPublicKey) {
                const hasAccount = currentDerivedKeyAccounts.some(
                    account => account.tonWallet.address === address,
                )

                if (!hasAccount) {
                    await this.rpcStore.rpc.createAccount({
                        contractType,
                        publicKey,
                        workchain,
                        name: value.name,
                        explicitAddress: address,
                    })

                    await this.accountability.selectAccount(address)
                    this.handle.close()
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
                    await this.rpcStore.rpc.createAccount({
                        contractType,
                        publicKey,
                        workchain,
                        name: value.name,
                        explicitAddress: address,
                    })

                    this.logger.log('[CreateAccountViewModel] create and add account to externals')
                }
                else {
                    await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)
                    await this.rpcStore.rpc.updateAccountVisibility(address, true)

                    this.logger.log('[CreateAccountViewModel] add to externals')
                }

                await this.accountability.selectAccount(address)
                this.handle.close()
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
                break
        }
    }

    public async onManageDerivedKey(): Promise<void> {
        await this.rpcStore.rpc.tempStorageInsert('manage_seeds', {
            step: 'manage_key',
            key: this.currentDerivedKey,
        })
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'manage_seeds',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
        this.handle.close()
    }

    private async getAvailablePublicKey(contractType: nt.ContractType): Promise<PublicKey> {
        const { accountsByKey } = this

        for await (const key of this.iteratePublicKeys()) {
            const accounts = accountsByKey[key.publicKey]
            const account = accounts?.find(({ tonWallet }) => tonWallet.contractType === contractType)

            if (!account) return key
        }

        throw new Error(this.localization.intl.formatMessage({ id: 'CREATE_ACCOUNT_GENERIC_ERROR' }))
    }

    private async* iteratePublicKeys() {
        let page = 0

        while (page < 20) {
            const keys = await this.getPublicKeys(page)
            for (const key of keys) {
                yield key
            }
            page++
        }

        throw new Error(this.localization.intl.formatMessage({ id: 'CREATE_ACCOUNT_GENERIC_ERROR' }))
    }

    private async getPublicKeys(page = 0): Promise<PublicKey[]> {
        if (this.currentDerivedKey.signerName === 'ledger_key') {
            try {
                return this.rpcStore.rpc.getLedgerPage(page)
            }
            catch (e) {
                await this.connectLedger()
                throw e
            }
        }

        const rawPublicKeys = await this.rpcStore.rpc.getPublicKeys({
            type: 'master_key',
            data: {
                password: this.password,
                offset: page * PUBLIC_KEYS_LIMIT,
                limit: PUBLIC_KEYS_LIMIT,
                masterKey: this.currentDerivedKey.masterKey,
            },
        })

        return rawPublicKeys.map((publicKey, index) => ({ publicKey, index }))
    }

    private async connectLedger(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInBrowser({
            route: 'ledger',
            force: true,
        })
        await closeCurrentWindow()
    }

}

const PUBLIC_KEYS_LIMIT = 5

interface PublicKey {
    publicKey: string;
    index: number;
}

export enum Step {
    Index,
    EnterAddress,
    EnterName,
    SelectContractType,
}
