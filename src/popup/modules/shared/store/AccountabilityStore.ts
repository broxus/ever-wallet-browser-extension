import type * as nt from '@broxus/ever-wallet-wasm'
import { computed, makeAutoObservable, observe, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'

import { ACCOUNTS_TO_SEARCH, AggregatedMultisigTransactions, CONTRACT_TYPE_NAMES, currentUtime, TokenWalletState } from '@app/shared'
import type { ExternalAccount, Nekoton, StoredBriefMessageInfo } from '@app/models'

import { Logger, Utils } from '../utils'
import { NekotonToken } from '../di-container'
import { RpcStore } from './RpcStore'

@singleton()
export class AccountabilityStore {

    public currentAccountAddress: string | undefined

    public currentDerivedKey: nt.KeyStoreEntry | undefined

    public currentMasterKey: nt.KeyStoreEntry | undefined

    private _selectedAccountAddress = this.rpcStore.state.selectedAccountAddress

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, {
            accountEntries: computed.struct,
            storedKeys: computed.struct,
        }, { autoBind: true })

        this.initialize()
    }

    private async initialize() {
        this.utils.reaction(() => this.selectedMasterKey, async (selectedMasterKey) => {
            if (!selectedMasterKey) return

            const key = Object.values(this.storedKeys).find(({ masterKey }) => masterKey === selectedMasterKey)

            if (key !== undefined) {
                await this.rpcStore.rpc.updateRecentMasterKey(key)
            }
        }, { fireImmediately: true })

        this.utils.reaction(() => this.rpcStore.state.selectedAccountAddress, async (address) => {
            if (this._selectedAccountAddress !== address) {
                runInAction(() => {
                    this._selectedAccountAddress = address
                })
            }
        }, { fireImmediately: true })

        if (process.env.NODE_ENV !== 'production') {
            this.utils.register(
                observe(this, () => {
                    this.logger.log('[AccountabilityStore]', this)
                }),
            )
        }

        for (const address of Object.keys(this.accountEntries)) {
            if (this.accountsVisibility[address] == null) {
                await this.rpcStore.rpc.updateAccountVisibility(address as string, true)
            }
        }
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

    public get externalAccounts(): Array<ExternalAccount> {
        return this.rpcStore.state.externalAccounts
    }

    public get selectedMasterKey(): string | undefined {
        return this.rpcStore.state.selectedMasterKey
    }

    public get accountsVisibility(): Record<string, boolean> {
        return this.rpcStore.state.accountsVisibility ?? {}
    }

    public get selectedAccountAddress(): string | undefined {
        return this._selectedAccountAddress
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
        const set = new Set<string>()
        const keys: nt.KeyStoreEntry[] = []

        for (const key of Object.values(this.storedKeys)) {
            if (!set.has(key.masterKey)) {
                set.add(key.masterKey)
                keys.push(key)
            }
        }

        return keys
    }

    public get keysByMasterKey(): Record<string, nt.KeyStoreEntry[]> {
        return Object.values(this.storedKeys).reduce((result, key) => {
            if (!result[key.masterKey]) {
                result[key.masterKey] = []
            }
            result[key.masterKey].push(key)
            return result
        }, {} as Record<string, nt.KeyStoreEntry[]>)
    }

    // All direct derived keys in managed seed
    public get derivedKeys(): nt.KeyStoreEntry[] {
        if (!this.currentMasterKey) return []
        return (this.keysByMasterKey[this.currentMasterKey.masterKey] ?? [])
            .sort((a, b) => a.accountId - b.accountId)
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
        if (!this.selectedMasterKey) return []
        return this.keysByMasterKey[this.selectedMasterKey]?.map(key => key.publicKey) ?? []
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

    public get accountDetails(): { [p: string]: nt.TonWalletDetails } {
        return this.rpcStore.state.accountDetails
    }

    public get contractTypeDetails(): nt.TonWalletDetails | undefined {
        if (!this.selectedAccount) {
            return undefined
        }

        const details = this.accountDetails[this.selectedAccount.tonWallet.address] as nt.TonWalletDetails | undefined

        return details != null
            ? details
            : this.nekoton.getContractTypeDefaultDetails(
                this.selectedAccount.tonWallet.contractType,
            )
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

    public get selectedAccountUnconfirmedTransactions(): string[] {
        const source = this.selectedAccountAddress

        if (source && this.accountUnconfirmedTransactions[source]) {
            const unconfirmedTransactions = this.accountUnconfirmedTransactions[source]
            const expirationTime = this.accountDetails[source]?.expirationTime ?? 3600
            const time = currentUtime(this.clockOffset)

            return Object.keys(unconfirmedTransactions).reduce((result, transactionId) => {
                const info = this.accountMultisigTransactions[source]?.[transactionId]

                if (info && !info.finalTransactionHash && !(info.createdAt + expirationTime <= time)) {
                    result.push(transactionId)
                }

                return result
            }, [] as string[])
        }

        return []
    }

    public get accountsByKey(): Record<string, number> {
        return Object.values(this.accountEntries).reduce((result, account) => {
            if (!result[account.tonWallet.publicKey]) {
                result[account.tonWallet.publicKey] = 0
            }
            result[account.tonWallet.publicKey]++
            return result
        }, {} as Record<string, number>)
    }

    public get currentAccount(): nt.AssetsList | undefined {
        if (!this.currentAccountAddress) return undefined
        return this.accountEntries[this.currentAccountAddress]
    }

    private get clockOffset(): number {
        return this.rpcStore.state.clockOffset
    }

    private get accountUnconfirmedTransactions() {
        return this.rpcStore.state.accountUnconfirmedTransactions
    }

    private get accountMultisigTransactions(): Record<string, AggregatedMultisigTransactions> {
        return this.rpcStore.state.accountMultisigTransactions
    }

    public setCurrentAccountAddress(address: string | undefined): void {
        this.currentAccountAddress = address
    }

    public setCurrentDerivedKey(key: nt.KeyStoreEntry | undefined): void {
        this.currentDerivedKey = key
    }

    public setCurrentMasterKey(key: nt.KeyStoreEntry | undefined): void {
        this.currentMasterKey = key
    }

    public onManageMasterKey(value?: nt.KeyStoreEntry): void {
        this.setCurrentMasterKey(value)
    }

    public onManageDerivedKey(derivedKey?: nt.KeyStoreEntry): void {
        this.setCurrentDerivedKey(derivedKey)
    }

    public onManageAccount(account: nt.AssetsList): void {
        this.setCurrentAccountAddress(account.tonWallet.address)
    }

    public async logOut(): Promise<void> {
        await this.rpcStore.rpc.logOut()
        await this.rpcStore.rpc.openExtensionInBrowser({})
        window.close()
    }

    public reset(): void {
        this.setCurrentAccountAddress(undefined)
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
                .map<nt.AccountToAdd>(wallet => ({
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

    public getAccountsByMasterKey(masterKey: string): nt.AssetsList[] {
        const accounts = new Map<string, nt.AssetsList>()
        const derivedKeys = new Set<string>(
            Object.values(this.storedKeys)
                .filter(item => item.masterKey === masterKey)
                .map(item => item.publicKey),
        )

        Object.values(this.accountEntries).forEach((account) => {
            if (derivedKeys.has(account.tonWallet.publicKey)) {
                accounts.set(account.tonWallet.address, account)
            }
        })

        this.externalAccounts.forEach(({ address, externalIn }) => {
            derivedKeys.forEach(derivedKey => {
                if (externalIn.includes(derivedKey)) {
                    const account = this.accountEntries[address] as nt.AssetsList | undefined

                    if (account) {
                        accounts.set(account.tonWallet.address, account)
                    }
                }
            })
        })

        return [...accounts.values()]
            .sort((a, b) => a.name.localeCompare(b.name))
    }

    public async selectAccount(address: string): Promise<void> {
        // optimistic update, prevents from lag between carousel navigation and UI update
        this._selectedAccountAddress = address
        await this.rpcStore.rpc.selectAccount(address)
    }

}

export interface SelectableKeys {
    deployer: nt.KeyStoreEntry | undefined;
    keys: nt.KeyStoreEntry[];
}
