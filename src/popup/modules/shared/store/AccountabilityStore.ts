import { AccountToAdd } from '@wallet/nekoton-wasm'
import type nt from '@wallet/nekoton-wasm'
import uniqBy from 'lodash.uniqby'
import {
    computed, IReactionDisposer, Lambda, makeAutoObservable, observe, reaction,
} from 'mobx'
import { Disposable, inject, singleton } from 'tsyringe'

import { ACCOUNTS_TO_SEARCH, CONTRACT_TYPE_NAMES, Logger, TokenWalletState } from '@app/shared';
import { Nekoton, StoredBriefMessageInfo } from '@app/models'

import { NekotonToken } from '../di-container'
import { RpcStore } from './RpcStore'

@singleton()
export class AccountabilityStore implements Disposable {

    public step: AccountabilityStep = AccountabilityStep.MANAGE_SEEDS

    public currentAccount: nt.AssetsList | undefined

    public currentDerivedKey: nt.KeyStoreEntry | undefined

    public currentMasterKey: nt.KeyStoreEntry | undefined

    private reactionDisposer: IReactionDisposer | undefined

    private loggerDisposer: Lambda | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<AccountabilityStore, any>(this, {
            nekoton: false,
            rpcStore: false,
            logger: false,
            accountEntries: computed.struct,
        }, { autoBind: true })

        this.initialize()
    }

    private async initialize() {
        this.reactionDisposer = reaction(() => this.selectedMasterKey, async selectedMasterKey => {
            if (!selectedMasterKey) return

            const key = Object.values(this.storedKeys).find(({ masterKey }) => masterKey === selectedMasterKey)

            if (key !== undefined) {
                await this.rpcStore.rpc.updateRecentMasterKey(key)
            }
        }, { fireImmediately: true })

        if (process.env.NODE_ENV !== 'production') {
            this.loggerDisposer = observe(this, () => {
                this.logger.log('[AccountabilityStore]', this)
            })
        }

        for (const address of Object.keys(this.accountEntries)) {
            if (this.accountsVisibility[address] == null) {
                await this.rpcStore.rpc.updateAccountVisibility(address as string, true)
            }
        }
    }

    public dispose(): void | Promise<void> {
        this.reactionDisposer?.()
        this.loggerDisposer?.()
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        return this.rpcStore.state.storedKeys
    }

    public get accountCustodians(): Record<string, string[]> {
        return this.rpcStore.state.accountCustodians
    }

    public get accountEntries(): Record<string, nt.AssetsList> {
        return this.rpcStore.state.accountEntries
    }

    public get externalAccounts(): Array<{ address: string; externalIn: string[]; publicKey: string }> {
        return this.rpcStore.state.externalAccounts
    }

    public get selectedMasterKey(): string | undefined {
        return this.rpcStore.state.selectedMasterKey
    }

    public get accountsVisibility(): Record<string, boolean> {
        return this.rpcStore.state.accountsVisibility ?? {}
    }

    public get selectedAccountAddress(): string | undefined {
        return this.rpcStore.state.selectedAccountAddress
    }

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.selectedAccountAddress ? this.accountEntries[this.selectedAccountAddress] : undefined
    }

    public get selectedAccountPublicKey(): string | undefined {
        return this.selectedAccount?.tonWallet.publicKey
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.rpcStore.state.accountContractStates
    }

    public get accountTokenStates(): Record<string, Record<string, TokenWalletState>> {
        return this.rpcStore.state.accountTokenStates
    }

    public get masterKeysNames(): Record<string, string> {
        return this.rpcStore.state.masterKeysNames ?? {}
    }

    public get recentMasterKeys(): nt.KeyStoreEntry[] {
        return this.rpcStore.state.recentMasterKeys ?? []
    }

    // TON Wallet contract state of selected account
    public get everWalletState(): nt.ContractState | undefined {
        return this.selectedAccountAddress ? this.accountContractStates[this.selectedAccountAddress] : undefined
    }

    // Token Wallet state of selected account
    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.selectedAccountAddress ? this.accountTokenStates?.[this.selectedAccountAddress] ?? {} : {}
    }

    public get accountTransactions(): Record<string, nt.TonWalletTransaction[]> {
        return this.rpcStore.state.accountTransactions
    }

    public get selectedAccountTransactions(): nt.TonWalletTransaction[] {
        if (!this.selectedAccountAddress) return []

        return this.rpcStore.state.accountTransactions[this.selectedAccountAddress] ?? []
    }

    public get accountTokenTransactions(): Record<string, Record<string, nt.TokenWalletTransaction[]>> {
        return this.rpcStore.state.accountTokenTransactions
    }

    public get selectedAccountTokenTransactions(): Record<string, nt.TokenWalletTransaction[]> {
        if (!this.selectedAccountAddress) return {}

        return this.rpcStore.state.accountTokenTransactions[this.selectedAccountAddress] ?? {}
    }

    public get accountPendingTransactions(): Record<string, Record<string, StoredBriefMessageInfo>> {
        return this.rpcStore.state.accountPendingTransactions
    }

    public get selectedAccountPendingTransactions(): StoredBriefMessageInfo[] {
        if (!this.selectedAccountAddress) return []

        const values = Object.values(
            this.rpcStore.state.accountPendingTransactions[this.selectedAccountAddress] ?? {},
        )

        return values.sort((a, b) => b.createdAt - a.createdAt)
    }

    // All available keys includes master key
    public get masterKeys(): nt.KeyStoreEntry[] {
        return uniqBy(
            Object.values(this.storedKeys),
            ({ masterKey }) => masterKey,
        )
    }

    // All direct derived keys in managed seed
    public get derivedKeys(): nt.KeyStoreEntry[] {
        return Object.values(this.storedKeys).filter(
            key => key.masterKey === this.currentMasterKey?.masterKey,
        )
    }

    // All related accounts in managed derived key
    public get currentDerivedKeyAccounts(): nt.AssetsList[] {
        if (!this.currentDerivedKey) {
            return []
        }

        return Object.values(this.accountEntries).filter(
            entry => entry.tonWallet.publicKey === this.currentDerivedKey!.publicKey,
        )
    }

    // All linked external accounts in managed derived key
    public get currentDerivedKeyExternalAccounts(): nt.AssetsList[] {
        if (!this.currentDerivedKey) {
            return []
        }

        return this.externalAccounts
            .filter(account => account.externalIn.includes(this.currentDerivedKey!.publicKey))
            .map(account => this.accountEntries[account.address])
            .filter(account => !!account)
    }

    public get derivedKeysPubKeys(): string[] {
        return Object.values(this.storedKeys)
            .filter(key => key.masterKey === this.selectedMasterKey)
            .map(key => key.publicKey)
    }

    // All available accounts of the selected seed
    public get internalAccounts(): Record<string, nt.AssetsList> {
        const accounts: Record<string, nt.AssetsList> = {}
        const { derivedKeysPubKeys } = this

        Object.values(this.accountEntries).forEach(entry => {
            if (derivedKeysPubKeys.includes(entry.tonWallet.publicKey) && !accounts[entry.tonWallet.address]) {
                accounts[entry.tonWallet.address] = entry
            }
        })

        return accounts
    }

    public get accounts(): nt.AssetsList[] {
        const externalAccounts: { [address: string]: nt.AssetsList } = { ...this.internalAccounts }

        this.externalAccounts.forEach(({ address, externalIn }) => {
            this.derivedKeysPubKeys.forEach(key => {
                if (externalIn.includes(key)) {
                    const entry = this.accountEntries[address]
                    if (entry != null && externalAccounts[entry.tonWallet.address] == null) {
                        externalAccounts[entry.tonWallet.address] = entry
                    }
                }
            })
        })

        return Object.values(externalAccounts)
            .filter(({ tonWallet }) => (tonWallet ? this.accountsVisibility[tonWallet.address] : false))
            .sort((a, b) => a.name.localeCompare(b.name))
    }

    public get contractTypeDetails(): nt.TonWalletDetails | undefined {
        if (!this.selectedAccount) {
            return undefined
        }

        return this.nekoton.getContractTypeDetails(this.selectedAccount.tonWallet.contractType)
    }

    public get nextAccountId(): number {
        if (!this.currentMasterKey) {
            return 0
        }

        const accountIds = Object.values(this.storedKeys)
            .filter(key => key.masterKey === this.currentMasterKey!.masterKey)
            .map(key => key.accountId)
            .sort((a, b) => a - b)

        let nextAccountId = 0
        for (let i = 0; i < accountIds.length; ++i) {
            if (nextAccountId !== accountIds[i]) {
                break
            }

            ++nextAccountId
        }

        return nextAccountId
    }

    public setCurrentAccount(account: nt.AssetsList | undefined): void {
        this.currentAccount = account
    }

    public setCurrentDerivedKey(key: nt.KeyStoreEntry | undefined): void {
        this.currentDerivedKey = key
    }

    public setCurrentMasterKey(key: nt.KeyStoreEntry | undefined): void {
        this.currentMasterKey = key
    }

    public setStep(step: AccountabilityStep): void {
        this.step = step
    }

    public onManageMasterKey(value?: nt.KeyStoreEntry): void {
        this.setCurrentMasterKey(value)
        this.setStep(AccountabilityStep.MANAGE_SEED)
    }

    public onManageDerivedKey(derivedKey?: nt.KeyStoreEntry): void {
        this.setCurrentDerivedKey(derivedKey)
        this.setStep(AccountabilityStep.MANAGE_DERIVED_KEY)
    }

    public onManageAccount(account?: nt.AssetsList): void {
        this.setCurrentAccount(account)
        this.setStep(AccountabilityStep.MANAGE_ACCOUNT)
    }

    public async logOut(): Promise<void> {
        await this.rpcStore.rpc.logOut()
        window.close()
    }

    public reset(): void {
        this.setStep(AccountabilityStep.MANAGE_SEEDS)
        this.setCurrentAccount(undefined)
        this.setCurrentDerivedKey(undefined)
        this.setCurrentMasterKey(undefined)
    }

    public getSelectableKeys(selectedAccount?: nt.AssetsList): SelectableKeys {
        const account = selectedAccount ?? this.selectedAccount

        if (!account) {
            return { deployer: undefined, keys: [] }
        }

        const accountability = this // eslint-disable-line @typescript-eslint/no-this-alias
        const accountAddress = account.tonWallet.address
        const accountPublicKey = account.tonWallet.publicKey

        return makeAutoObservable({
            get deployer(): nt.KeyStoreEntry | undefined {
                return accountability.storedKeys[accountPublicKey] as nt.KeyStoreEntry | undefined
            },
            get keys(): nt.KeyStoreEntry[] {
                const custodians = accountability.accountCustodians[accountAddress] as string[] | undefined
                return custodians
                    ?.map(publicKey => accountability.storedKeys[publicKey])
                    ?.filter(c => c) ?? []
            },
        })
    }

    public async addExistingWallets(publicKey: string, contractTypes = ACCOUNTS_TO_SEARCH): Promise<nt.AssetsList[]> {
        let accounts: nt.AssetsList[] = []

        try {
            const existingWallets = await this.rpcStore.rpc.findExistingWallets({
                publicKey,
                contractTypes,
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
                accounts = await this.rpcStore.rpc.createAccounts(accountsToAdd)
            }
        }
        catch (e) {
            this.logger.error(e)
        }

        return accounts
    }

}

export enum AccountabilityStep {
    MANAGE_SEEDS,
    MANAGE_SEED,
    CREATE_SEED,
    MANAGE_DERIVED_KEY,
    CREATE_DERIVED_KEY,
    MANAGE_ACCOUNT,
    CREATE_ACCOUNT,
}

export interface SelectableKeys {
    deployer: nt.KeyStoreEntry | undefined;
    keys: nt.KeyStoreEntry[];
}
