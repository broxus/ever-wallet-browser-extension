import type * as nt from '@broxus/ever-wallet-wasm'
import { comparer, computed, makeAutoObservable, observe, reaction, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import sortBy from 'lodash.sortby'
import BigNumber from 'bignumber.js'

import { ACCOUNTS_TO_SEARCH, AggregatedMultisigTransactions, convertCurrency, currentUtime, getContractName, TokenWalletState, convertPublicKey, delay, EVER_TOKEN_API_BASE_URL, VENOM_TOKEN_API_BASE_URL, NETWORK_GROUP, HAMSTER_TOKEN_API_BASE_URL, TYCHO_TESTNET_TOKEN_API_BASE_URL } from '@app/shared'
import type { ExternalAccount, Nekoton, StoredBriefMessageInfo, TokenWalletTransaction } from '@app/models'
import { ConnectionStore } from '@app/popup/modules/shared/store/ConnectionStore'

import { Logger } from '../utils'
import { NekotonToken } from '../di-container'
import { RpcStore } from './RpcStore'
import { Token, TokensStore } from './TokensStore'

@singleton()
export class AccountabilityStore {

    public currentAccountAddress: string | undefined

    public currentDerivedKey: nt.KeyStoreEntry | undefined

    public currentMasterKey: nt.KeyStoreEntry | undefined

    public newTokens: TokenWithBalance[] = []

    public newTokensLoading = false

    private refreshNewTokenCallId = 0

    private _selectedAccountAddress = this.rpcStore.state.selectedAccountAddress

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable(
            this,
            {
                accountEntries: computed.struct,
                storedKeys: computed.struct,
            },
            { autoBind: true },
        )

        this.initialize()
    }

    private async initialize() {
        reaction(
            () => this.selectedMasterKey,
            async (selectedMasterKey) => {
                if (!selectedMasterKey) return

                const key = Object.values(this.storedKeys).find(({ masterKey }) => masterKey === selectedMasterKey)

                if (key !== undefined) {
                    await this.rpcStore.rpc.updateRecentMasterKey(key)
                }
            },
            { fireImmediately: true },
        )

        reaction(
            () => this.rpcStore.state.selectedAccountAddress,
            async (address) => {
                if (this._selectedAccountAddress !== address) {
                    runInAction(() => {
                        this._selectedAccountAddress = address
                    })
                }
            },
            { fireImmediately: true },
        )

        reaction(
            () => [
                this.rpcStore.state.selectedConnection.connectionId,
                this.rpcStore.state.selectedAccountAddress,
                this.tokensStore.tokens,
                this.selectedAccount?.additionalAssets,
            ],
            () => this.refreshNewTokens(true),
            { fireImmediately: true, equals: comparer.structural },
        )

        if (process.env.NODE_ENV !== 'production') {
            observe(this, () => {
                this.logger.log('[AccountabilityStore]', this)
            })
        }

        for (const address of Object.keys(this.accountEntries)) {
            if (this.accountsVisibility[address] == null) {
                await this.rpcStore.rpc.updateAccountVisibility(address as string, true)
            }
        }
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        const externalStoredKeys = this.externalAccounts.reduce((acc, item) => {
            item.externalIn.forEach((masterKey) => {
                acc[item.publicKey] = {
                    name: '',
                    signerName: 'master_key',
                    publicKey: item.publicKey,
                    masterKey,
                    accountId: 999,
                }
            })

            return acc
        }, {} as Record<string, nt.KeyStoreEntry>)
        return {
            ...this.rpcStore.state.storedKeys,
            ...externalStoredKeys,
        }
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

    public get accountTokenTransactions(): Record<string, Record<string, TokenWalletTransaction[]>> {
        return this.rpcStore.state.accountTokenTransactions
    }

    public get selectedAccountTokenTransactions(): Record<string, TokenWalletTransaction[]> {
        if (!this.selectedAccountAddress) return {}

        return this.rpcStore.state.accountTokenTransactions[this.selectedAccountAddress] ?? {}
    }

    public get accountPendingTransactions(): Record<string, Record<string, StoredBriefMessageInfo>> {
        return this.rpcStore.state.accountPendingTransactions
    }

    public get selectedAccountPendingTransactions(): StoredBriefMessageInfo[] {
        if (!this.selectedAccountAddress) return []

        const values = Object.values(this.rpcStore.state.accountPendingTransactions[this.selectedAccountAddress] ?? {})

        return values.sort((a, b) => b.createdAt - a.createdAt)
    }

    // All available keys includes master key
    public get masterKeys(): nt.KeyStoreEntry[] {
        const set = new Set<string>()
        const result: nt.KeyStoreEntry[] = []
        const keys = sortBy(Object.values(this.storedKeys), (item) => item.accountId)

        for (const key of keys) {
            if (!set.has(key.masterKey)) {
                set.add(key.masterKey)
                result.push({
                    ...key,
                    name: this.masterKeysNames[key.masterKey] || convertPublicKey(key.masterKey),
                })
            }
        }

        return result
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
        return (this.keysByMasterKey[this.currentMasterKey.masterKey] ?? []).sort((a, b) => a.accountId - b.accountId)
    }

    // All related accounts in managed derived key
    public get currentDerivedKeyAccounts(): nt.AssetsList[] {
        if (!this.currentDerivedKey) {
            return []
        }

        return Object.values(this.accountEntries).filter((entry) => entry.tonWallet.publicKey
        === this.currentDerivedKey!.publicKey)
    }

    // All linked external accounts in managed derived key
    public get currentDerivedKeyExternalAccounts(): nt.AssetsList[] {
        if (!this.currentDerivedKey) {
            return []
        }

        return this.externalAccounts
            .filter((account) => account.externalIn.includes(this.currentDerivedKey!.publicKey))
            .map((account) => this.accountEntries[account.address])
            .filter((account) => !!account)
    }

    public get derivedKeysPubKeys(): string[] {
        if (!this.selectedMasterKey) return []
        return this.keysByMasterKey[this.selectedMasterKey]?.map((key) => key.publicKey) ?? []
    }

    // All available accounts of the selected seed
    public get internalAccounts(): Record<string, nt.AssetsList> {
        const accounts: Record<string, nt.AssetsList> = {}
        const { derivedKeysPubKeys } = this

        Object.values(this.accountEntries).forEach((entry) => {
            if (derivedKeysPubKeys.includes(entry.tonWallet.publicKey) && !accounts[entry.tonWallet.address]) {
                accounts[entry.tonWallet.address] = entry
            }
        })

        return accounts
    }

    public get accounts(): nt.AssetsList[] {
        const externalAccounts: { [address: string]: nt.AssetsList } = { ...this.internalAccounts }

        this.externalAccounts.forEach(({ address, externalIn }) => {
            this.derivedKeysPubKeys.forEach((key) => {
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

    public get accountsByPublicKey(): { [k: string]: nt.AssetsList[] | undefined } {
        return Object.values(this.accountEntries).reduce<{ [k: string]: nt.AssetsList[] | undefined }>((acc, item) => {
            const publicKey = item.tonWallet.publicKey
            if (!acc[publicKey]) acc[publicKey] = []
            acc[publicKey]?.push(item)
            return acc
        }, {})
    }

    public get accountDetails(): { [p: string]: nt.TonWalletDetails } {
        return this.rpcStore.state.accountDetails
    }

    public get contractTypeDetails(): nt.TonWalletDetails | undefined {
        if (!this.selectedAccount) {
            return undefined
        }

        const details = this.accountDetails[this.selectedAccount.tonWallet.address] as nt.TonWalletDetails | undefined

        return details != null ? details
            : this.nekoton.getContractTypeDefaultDetails(this.selectedAccount.tonWallet.contractType)
    }

    public get nextAccountId(): number {
        if (!this.currentMasterKey) {
            return 0
        }

        const accountIds = Object.values(this.storedKeys)
            .filter((key) => key.masterKey === this.currentMasterKey!.masterKey)
            .map((key) => key.accountId)
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
                return custodians?.map((publicKey) => accountability.storedKeys[publicKey])?.filter((c) => c) ?? []
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
                .filter((wallet) => wallet.contractState.isDeployed || wallet.contractState.balance !== '0')
                .map<nt.AccountToAdd>((wallet) => ({
                    name: getContractName(wallet.contractType, this.connectionStore.selectedConnectionNetworkType),
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
                .filter((item) => item.masterKey === masterKey)
                .map((item) => item.publicKey),
        )

        Object.values(this.accountEntries).forEach((account) => {
            if (derivedKeys.has(account.tonWallet.publicKey)) {
                accounts.set(account.tonWallet.address, account)
            }
        })

        this.externalAccounts.forEach(({ address, externalIn }) => {
            derivedKeys.forEach((derivedKey) => {
                if (externalIn.includes(derivedKey)) {
                    const account = this.accountEntries[address] as nt.AssetsList | undefined

                    if (account) {
                        accounts.set(account.tonWallet.address, account)
                    }
                }
            })
        })

        return [...accounts.values()].sort((a, b) => a.name.localeCompare(b.name))
    }

    public async selectAccount(address: string): Promise<void> {
        // optimistic update, prevents lag between carousel navigation and UI update
        this._selectedAccountAddress = address
        await this.rpcStore.rpc.selectAccount(address)
    }

    public async refreshNewTokens(reset: boolean): Promise<void> {
        if (reset) {
            this.newTokens = []
        }

        this.refreshNewTokenCallId += 1
        this.newTokensLoading = true
        const callId = this.refreshNewTokenCallId

        const selectedConnection = this.rpcStore.state.selectedConnection
        const tokenWalletAssets = this.selectedAccount?.additionalAssets[selectedConnection.group]?.tokenWallets ?? []
        const tokenWallets = new Set<string>(
            tokenWalletAssets.map(({ rootTokenContract }) => rootTokenContract),
        )

        const tokens = this.tokensStore.tokens
        const rootAddresses = Object.keys(tokens)

        if (!rootAddresses.length) return

        const networkGroupToURL = {
            [NETWORK_GROUP.MAINNET_EVERSCALE]: `${EVER_TOKEN_API_BASE_URL}/balances`,
            [NETWORK_GROUP.MAINNET_VENOM]: `${VENOM_TOKEN_API_BASE_URL}/balances`,
            [NETWORK_GROUP.HAMSTER]: `${HAMSTER_TOKEN_API_BASE_URL}/balances/search`,
            [NETWORK_GROUP.TESTNET_TYCHO]: `${TYCHO_TESTNET_TOKEN_API_BASE_URL}/balances/search`,
        }

        const networkGroup = this.connectionStore.selectedConnection.group

        let apiRequestSuccess = false

        if (
            networkGroup === NETWORK_GROUP.MAINNET_EVERSCALE
            || networkGroup === NETWORK_GROUP.MAINNET_VENOM
            || networkGroup === NETWORK_GROUP.HAMSTER
            || networkGroup === NETWORK_GROUP.TESTNET_TYCHO
        ) {
            const body = (() => {
                switch (networkGroup) {
                    case NETWORK_GROUP.TESTNET_TYCHO:
                    case NETWORK_GROUP.HAMSTER:
                        return {
                            ownerAddress: this.selectedAccountAddress,
                            rootAddresses,
                            limit: rootAddresses.length,
                        }
                    default:
                        return {
                            ownerAddress: this.selectedAccountAddress,
                            rootAddresses,
                            limit: rootAddresses.length,
                            offset: 0,
                        }
                }
            })()

            const url = networkGroupToURL[networkGroup]

            try {
                const response = await fetch(url, {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                if (response.ok) {
                    const data = await response.json()

                    data.balances.forEach((item: any) => {
                        const token = tokens[item.rootAddress]

                        if (tokenWallets.has(item.rootAddress)) {
                            runInAction(() => {
                                this.newTokens = this.newTokens.filter(
                                    tokenWithBalance => tokenWithBalance.address !== item.rootAddress,
                                )
                            })
                        }
                        else if (new BigNumber(item.amount).lte(0)) {
                            runInAction(() => {
                                this.newTokens = this.newTokens.filter(
                                    tokenWithBalance => tokenWithBalance.address !== item.rootAddress,
                                )
                            })
                        }
                        else if (token) {
                            const index = this.newTokens.findIndex(
                                tokenWithBalance => tokenWithBalance.address === item.rootAddress,
                            )
                            if (index === -1) {
                                runInAction(() => {
                                    this.newTokens.push({
                                        ...token,
                                        balance: item.amount,
                                    })
                                })
                            }
                            else {
                                runInAction(() => {
                                    this.newTokens[index].balance = item.amount
                                })
                            }
                        }
                    })

                    apiRequestSuccess = true
                }
            }
            catch (e) {
                this.logger.error(e)
            }
        }

        if (!apiRequestSuccess) {
            for (const token of Object.values(tokens)) {
                if (this.refreshNewTokenCallId !== callId) {
                    return
                }

                if (token) {
                    if (tokenWallets.has(token.address)) {
                        runInAction(() => {
                            this.newTokens = this.newTokens.filter(
                                tokenWithBalance => tokenWithBalance.address !== token.address,
                            )
                        })
                    }
                    else {
                        try {
                            const balance = await this.rpcStore.rpc.getTokenBalance(
                                this.selectedAccountAddress!,
                                token.address,
                            )

                            if (balance) {
                                if (balance === '0') {
                                    runInAction(() => {
                                        this.newTokens = this.newTokens.filter(
                                            tokenWithBalance => tokenWithBalance.address !== token.address,
                                        )
                                    })
                                }
                                else {
                                    const index = this.newTokens.findIndex(
                                        tokenWithBalance => tokenWithBalance.address === token.address,
                                    )
                                    if (index === -1) {
                                        runInAction(() => {
                                            this.newTokens.push({
                                                ...token,
                                                balance: convertCurrency(balance, token.decimals),
                                            })
                                        })
                                    }
                                    else {
                                        runInAction(() => {
                                            this.newTokens[index].balance = convertCurrency(balance, token.decimals)
                                        })
                                    }
                                }
                            }
                            await delay(100) // check rate limits
                        }
                        catch (e) {
                            this.logger.warn(e)
                        }
                    }
                }
            }
        }

        runInAction(() => {
            this.newTokensLoading = false
        })
    }

}

export interface SelectableKeys {
    deployer: nt.KeyStoreEntry | undefined;
    keys: nt.KeyStoreEntry[];
}

export interface TokenWithBalance extends Token {
    balance: string;
}
