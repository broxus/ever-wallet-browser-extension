import { Mutex } from '@broxus/await-semaphore'
import type * as nt from '@broxus/ever-wallet-wasm'
import { Buffer } from 'buffer'
import type { IgnoreTransactionTreeSimulationError } from 'everscale-inpage-provider'
import { mergeTransactions } from 'everscale-inpage-provider'
import cloneDeep from 'lodash.clonedeep'
import uniqWith from 'lodash.uniqwith'
import log from 'loglevel'
import browser from 'webextension-polyfill'

import {
    AggregatedMultisigTransactionInfo,
    AggregatedMultisigTransactions,
    currentUtime,
    extractMultisigTransactionTime,
    getDefaultContractType,
    getOrInsertDefault,
    isFromZerostate,
    NekotonRpcError,
    RpcErrorCode,
    SendMessageCallback,
    TokenWalletState, TON_TOKEN_API_BASE_URL,
} from '@app/shared'
import type {
    BriefMessageInfo,
    ConfirmMessageToPrepare,
    DeployMessageToPrepare,
    ExternalAccount,
    JettonSymbol,
    KeyToDerive,
    KeyToRemove,
    LedgerKeyToCreate,
    MasterKeyToCreate,
    Nekoton,
    StoredBriefMessageInfo,
    TokenMessageToPrepare,
    TokenWalletsToUpdate, TokenWalletTransaction,
    TransactionTreeSimulationParams,
    TransferMessageToPrepare,
    UserMnemonic,
    WalletMessageToSend,
} from '@app/models'

import { BACKGROUND_POLLING_INTERVAL, DEFAULT_POLLING_INTERVAL } from '../../constants'
import { LedgerBridge } from '../../ledger/LedgerBridge'
import { ContractFactory } from '../../utils/Contract'
import { Deserializers, Storage } from '../../utils/Storage'
import { BaseConfig, BaseController, BaseState } from '../BaseController'
import { ConnectionController } from '../ConnectionController'
import { LocalizationController } from '../LocalizationController'
import { ITokenWalletHandler, TokenWalletSubscription } from './TokenWalletSubscription'
import { EverWalletSubscription, IEverWalletHandler } from './EverWalletSubscription'
import { JettonWalletSubscription, IJettonWalletHandler } from './JettonWalletSubscription'

export interface ITransactionsListener {
    onEverTransactionsFound?(
        address: string,
        walletDetails: nt.TonWalletDetails,
        transactions: nt.TonWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ): void
    onTokenTransactionsFound?(
        owner: string,
        rootTokenContract: string,
        transactions: nt.TokenWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ): void

    onJettonTransactionsFound?(
        owner: string,
        rootTokenContract: string,
        transactions: nt.JettonWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ): void
}

export interface AccountControllerConfig extends BaseConfig {
    nekoton: Nekoton;
    accountsStorage: nt.AccountsStorage;
    keyStore: nt.KeyStore;
    clock: nt.ClockWithOffset;
    connectionController: ConnectionController;
    localizationController: LocalizationController;
    ledgerBridge: LedgerBridge;
    contractFactory: ContractFactory;
    storage: Storage<AccountStorage>
}

export interface AccountControllerState extends BaseState {
    accountEntries: { [address: string]: nt.AssetsList };
    accountContractStates: { [address: string]: nt.ContractState };
    accountCustodians: { [address: string]: string[] };
    accountDetails: { [address: string]: nt.TonWalletDetails }
    accountTokenStates: { [address: string]: { [rootTokenContract: string]: TokenWalletState } };
    accountTransactions: { [address: string]: nt.TonWalletTransaction[] };
    accountMultisigTransactions: { [address: string]: AggregatedMultisigTransactions };
    accountUnconfirmedTransactions: {
        [address: string]: { [transactionId: string]: nt.MultisigPendingTransaction }
    };
    accountTokenTransactions: {
        [address: string]: { [rootTokenContract: string]: TokenWalletTransaction[] }
    };
    accountPendingTransactions: {
        [address: string]: { [messageHash: string]: StoredBriefMessageInfo }
    };
    accountsVisibility: { [address: string]: boolean };
    externalAccounts: ExternalAccount[];
    knownTokens: { [rootTokenContract: string]: nt.Symbol | JettonSymbol };
    recentMasterKeys: nt.KeyStoreEntry[];
    selectedAccountAddress: string | undefined;
    selectedMasterKey: string | undefined;
    masterKeysNames: { [masterKey: string]: string };
    storedKeys: { [publicKey: string]: nt.KeyStoreEntry };
}

const defaultState: AccountControllerState = {
    accountEntries: {},
    accountContractStates: {},
    accountCustodians: {},
    accountDetails: {},
    accountTokenStates: {},
    accountTransactions: {},
    accountMultisigTransactions: {},
    accountUnconfirmedTransactions: {},
    accountTokenTransactions: {},
    accountPendingTransactions: {},
    accountsVisibility: {},
    externalAccounts: [],
    knownTokens: {},
    masterKeysNames: {},
    recentMasterKeys: [],
    selectedAccountAddress: undefined,
    selectedMasterKey: undefined,
    storedKeys: {},
}

// TODO: refactor network type check (network === 'ton' ? ... : ...)
export class AccountController extends BaseController<AccountControllerConfig, AccountControllerState> {

    private readonly _everWalletSubscriptions = new Map<string, EverWalletSubscription>()

    private readonly _tokenWalletSubscriptions = new Map<string, Map<string, TokenWalletSubscription>>()

    private readonly _jettonWalletSubscriptions = new Map<string, Map<string, JettonWalletSubscription>>()

    private readonly _sendMessageRequests = new Map<string, Map<string, SendMessageCallback>>()

    private readonly _accountsMutex = new Mutex()

    private _lastTransactions: Record<string, nt.TransactionId> = {}

    private _lastTokenTransactions: Record<string, Record<string, nt.TransactionId>> = {}

    private _transactionsListeners: ITransactionsListener[] = []

    private _intensivePollingEnabled = false

    constructor(
        config: AccountControllerConfig,
        state?: AccountControllerState,
    ) {
        super(config, state || cloneDeep(defaultState))

        this.initialize()
    }

    protected async addAdditionalAssets<T extends nt.AssetsList | undefined>(value: T): Promise<T>;
    protected async addAdditionalAssets<T extends nt.AssetsList>(value: T[]): Promise<T[]>;
    protected async addAdditionalAssets<T extends nt.AssetsList | undefined | nt.AssetsList[]>(value: T): Promise<T> {
        try {
            const { nekoton, storage, connectionController } = this.config
            const hiddenAdditionalAssets = await storage.get('hiddenAdditionalAssets')


            const assets = connectionController.connectionConfig.blockchains
                .map(item => ({ group: item.networkGroup,
                    type: item.network,
                    tokens: item.defaultActiveAssets?.map(el => el.address) ?? [] }))

            assets.forEach(({ group, tokens, type }) => {
                tokens.forEach(tokenRoot => {
                    const rootTokenContract = type === 'ton'
                        ? nekoton.repackAddress(tokenRoot)
                        : tokenRoot

                    const push = (assetsList: nt.AssetsList) => {
                        if (!hiddenAdditionalAssets?.[assetsList.tonWallet.address]?.[group]?.includes(tokenRoot)) {
                            assetsList.additionalAssets[group] = assetsList.additionalAssets[group] || {
                                depools: [],
                                tokenWallets: [],
                            }

                            const index = assetsList.additionalAssets[group].tokenWallets
                                .findIndex(item => item.rootTokenContract === rootTokenContract)

                            if (index === -1) {
                                assetsList.additionalAssets[group].tokenWallets.unshift({ rootTokenContract })
                            }
                        }
                    }

                    if (Array.isArray(value)) {
                        value.forEach(push)
                    }
                    else if (value) {
                        push(value)
                    }
                })
            })
        }
        catch (e) {
            log.error('addAdditionalAssets', e)
        }

        return value
    }

    public async initialSync() {
        const { storage, accountsStorage } = this.config
        const storedKeys = await this._getStoredKeys()

        this._lastTransactions = storage.snapshot.lastTransactions ?? {}
        this._lastTokenTransactions = storage.snapshot.lastTokenTransactions ?? {}


        const externalAccounts = storage.snapshot.externalAccounts ?? []

        const accountEntries: AccountControllerState['accountEntries'] = {}
        const entries = await this.addAdditionalAssets(await accountsStorage.getStoredAccounts())
        for (const entry of entries) {
            accountEntries[entry.tonWallet.address] = entry
        }

        let selectedAccountAddress = storage.snapshot.selectedAccountAddress,
            selectedAccount: nt.AssetsList | undefined // vscode code highlighting breaks without this comment

        if (selectedAccountAddress) {
            selectedAccount = accountEntries[selectedAccountAddress]
        }
        if (!selectedAccount) {
            [selectedAccount] = entries
            selectedAccountAddress = selectedAccount?.tonWallet?.address
        }

        let selectedMasterKey = storage.snapshot.selectedMasterKey
        if (selectedMasterKey == null && selectedAccount !== undefined) {
            selectedMasterKey = storedKeys[selectedAccount.tonWallet.publicKey]?.masterKey

            if (selectedMasterKey == null) {
                const { address } = selectedAccount.tonWallet
                for (const externalAccount of externalAccounts) {
                    if (externalAccount.address !== address) {
                        continue
                    }

                    const externalIn = externalAccount.externalIn[0] as string | undefined
                    if (externalIn != null) {
                        selectedMasterKey = storedKeys[externalIn]?.masterKey
                    }
                    break
                }
            }
        }

        const accountsVisibility = storage.snapshot.accountsVisibility ?? {}
        const masterKeysNames = storage.snapshot.masterKeysNames ?? {}
        const recentMasterKeys = storage.snapshot.recentMasterKeys ?? []
        const knownTokens = storage.snapshot.knownTokens ?? {}
        const accountPendingTransactions = storage.snapshot.accountPendingTransactions ?? {}

        this._schedulePendingTransactionsExpiration(accountPendingTransactions)

        this.update({
            accountsVisibility,
            accountPendingTransactions,
            selectedAccountAddress,
            accountEntries,
            externalAccounts,
            masterKeysNames,
            recentMasterKeys,
            selectedMasterKey,
            storedKeys,
            knownTokens,
        })
    }

    public async startSubscriptions() {
        log.trace('startSubscriptions')

        const { selectedConnection } = this.config.connectionController.state

        await this._accountsMutex.use(async () => {
            log.trace('startSubscriptions -> mutex gained')

            const { accountsStorage } = this.config
            const { accountEntries } = this.state

            const iterateEntries = (f: (entry: nt.AssetsList) => void) => Promise.all(
                Object.values(accountEntries).map(f),
            )
            const invalidTokenWallets: Array<{ owner: string, rootTokenContract: string }> = []

            await iterateEntries(async ({ tonWallet, additionalAssets }) => {
                try {
                    await this._createEverWalletSubscription(
                        tonWallet.address,
                        tonWallet.publicKey,
                        tonWallet.contractType,
                    )

                    const assets = additionalAssets[selectedConnection.group] as
                        | nt.AdditionalAssets
                        | undefined

                    if (assets) {
                        const results = await Promise.allSettled(
                            assets.tokenWallets.map(async ({ rootTokenContract }) => {
                                if (selectedConnection.network === 'ton') {
                                    await this._createJettonWalletSubscription(
                                        tonWallet.address,
                                        rootTokenContract,
                                    )
                                }
                                else {
                                    await this._createTokenWalletSubscription(
                                        tonWallet.address,
                                        rootTokenContract,
                                    )
                                }
                            }),
                        )

                        for (let i = 0; i < results.length; i++) {
                            const result = results[i]

                            if (result.status === 'rejected' && result.reason?.message === 'Invalid root token contract') {
                                invalidTokenWallets.push({
                                    owner: tonWallet.address,
                                    rootTokenContract: assets.tokenWallets[i].rootTokenContract,
                                })
                            }
                        }
                    }
                }
                catch (e) {
                    log.trace('startSubscriptions -> failed to create subscription', tonWallet.address, e)
                }
            })

            if (invalidTokenWallets.length) {
                log.trace('startSubscriptions -> remove invalid token wallets', invalidTokenWallets)

                const update = {
                    accountEntries: cloneDeep(accountEntries),
                }

                await Promise.all(invalidTokenWallets.map(async ({ owner, rootTokenContract }) => {
                    try {
                        await accountsStorage.removeTokenWallet(
                            owner,
                            selectedConnection.group,
                            rootTokenContract,
                        )

                        const additionalAssets = update.accountEntries[owner].additionalAssets[selectedConnection.group]
                        additionalAssets.tokenWallets = additionalAssets.tokenWallets.filter(
                            (wallet) => wallet.rootTokenContract !== rootTokenContract,
                        )
                    }
                    catch (e) {
                        log.trace(`startSubscriptions -> filed to remove invalid token wallet: owner(${owner}), rootTokenContract(${rootTokenContract})`, e)
                    }
                }))

                this.update(update)
            }

            if (this._intensivePollingEnabled) {
                this._enableIntensivePolling()
            }

            log.trace('startSubscriptions -> mutex released')
        })
    }

    public async stopSubscriptions() {
        log.trace('stopSubscriptions')

        await this._accountsMutex.use(async () => {
            log.trace('stopSubscriptions -> mutex gained')
            await this._stopSubscriptions()
            log.trace('stopSubscriptions -> mutex released')
        })
    }

    public async useEverWallet<T>(address: string, f: (wallet: nt.TonWallet) => Promise<T>) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        if (!subscription) {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                `There is no EVER wallet subscription for address ${address}`,
            )
        }
        return subscription.use(f)
    }

    public async findExistingWallets({
        publicKey,
        workchainId = 0,
        contractTypes,
    }: {
        publicKey: string
        workchainId: number
        contractTypes: nt.ContractType[]
    }): Promise<Array<nt.ExistingWalletInfo>> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            try {
                return await transport.findExistingWallets(publicKey, workchainId, contractTypes)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            }
        })
    }

    public async getEverWalletInitData(address: string): Promise<nt.TonWalletInitData> {
        return this._getEverWalletInitData(address)
    }

    public async getTokenRootDetailsFromTokenWallet(
        tokenWalletAddress: string,
    ): Promise<nt.RootTokenContractDetails> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            try {
                return await transport.getTokenRootDetailsFromTokenWallet(tokenWalletAddress)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            }
        })
    }

    public async getJettonRootDetailsFromJettonWallet(
        tokenWalletAddress: string,
    ): Promise<nt.RootJettonContractDetails> {
        const { connectionController } = this.config
        return connectionController.use(async ({ data: { transport }}) => {
            try {
                return await transport.getJettonRootDetailsFromJettonWallet(tokenWalletAddress)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            }
        })
    }

    public async getTokenRootDetails(
        rootContract: string,
        ownerAddress: string,
    ): Promise<nt.RootTokenContractDetailsWithAddress> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            try {
                return transport.getTokenRootDetails(rootContract, ownerAddress)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            }
        })
    }

    public async getJettonRootDetails(
        rootContract: string,
        ownerAddress: string,
    ): Promise<nt.RootJettonContractDetailsWithAddress> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            try {
                return transport.getJettonRootDetails(rootContract, ownerAddress)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            }
        })
    }

    public async getTokenWalletBalance(tokenWallet: string): Promise<string> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            try {
                return await transport.getTokenWalletBalance(tokenWallet)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            }
        })
    }

    public async getJettonWalletBalance(tokenWallet: string): Promise<string> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            try {
                return await transport.getJettonWalletBalance(tokenWallet)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            }
        })
    }

    public hasTokenWallet(address: string, rootTokenContract: string): boolean {
        const { selectedConnection } = this.config.connectionController.state
        const { accountEntries } = this.state

        return accountEntries[address]?.additionalAssets[selectedConnection.group]?.tokenWallets
            .some((wallet) => wallet.rootTokenContract === rootTokenContract) ?? false
    }

    public async updateTokenWallets(address: string, params: TokenWalletsToUpdate): Promise<void> {
        const { accountsStorage, connectionController, nekoton } = this.config

        const { network, group } = connectionController.state.selectedConnection
        const execute = network === 'ton'
            // TON
            ? async ([_rootTokenContract, enabled]: readonly [string, boolean]) => {
                const rootTokenContract = nekoton.repackAddress(_rootTokenContract)
                if (enabled) {
                    const subscription = await this._createJettonWalletSubscription(
                        address,
                        rootTokenContract,
                    )
                    await accountsStorage.addTokenWallet(
                        address,
                        group,
                        rootTokenContract,
                    )

                    if (this._intensivePollingEnabled) {
                        subscription.skipRefreshTimer()
                        subscription.setPollingInterval(DEFAULT_POLLING_INTERVAL)
                    }
                }
                else {
                    const jettonSubscriptions = this._jettonWalletSubscriptions.get(address)
                    const subscription = jettonSubscriptions?.get(rootTokenContract)
                    if (subscription != null) {
                        jettonSubscriptions?.delete(rootTokenContract)
                        await subscription.stop()
                    }
                    await accountsStorage.removeTokenWallet(
                        address,
                        group,
                        rootTokenContract,
                    )
                }
            }
            // EVER/VENOM
            : async ([rootTokenContract, enabled]: readonly [string, boolean]) => {
                if (enabled) {
                    const subscription = await this._createTokenWalletSubscription(
                        address,
                        rootTokenContract,
                    )
                    await accountsStorage.addTokenWallet(
                        address,
                        group,
                        rootTokenContract,
                    )

                    if (this._intensivePollingEnabled) {
                        subscription.skipRefreshTimer()
                        subscription.setPollingInterval(DEFAULT_POLLING_INTERVAL)
                    }
                }
                else {
                    const tokenSubscriptions = this._tokenWalletSubscriptions.get(address)
                    const subscription = tokenSubscriptions?.get(rootTokenContract)
                    if (subscription != null) {
                        tokenSubscriptions?.delete(rootTokenContract)
                        await subscription.stop()
                    }
                    await accountsStorage.removeTokenWallet(
                        address,
                        group,
                        rootTokenContract,
                    )
                }
            }

        try {
            await this._accountsMutex.use(async () => {
                await Promise.all(
                    Object.entries(params).map(execute),
                )

                const tokenSubscriptions = this._tokenWalletSubscriptions.get(address)
                const jettonSubscriptions = this._jettonWalletSubscriptions.get(address)

                const { accountTokenTransactions } = this.state
                const ownerTokenTransactions = {
                    ...accountTokenTransactions[address],
                }

                const currentTokenContracts = Object.keys(ownerTokenTransactions)
                for (const rootTokenContract of currentTokenContracts) {
                    if (network !== 'ton' && tokenSubscriptions?.get(rootTokenContract) == null) {
                        delete ownerTokenTransactions[rootTokenContract]
                    }
                    if (network === 'ton' && jettonSubscriptions?.get(rootTokenContract) == null) {
                        delete ownerTokenTransactions[rootTokenContract]
                    }
                }

                if ((tokenSubscriptions?.size || 0) === 0 && (jettonSubscriptions?.size || 0) === 0) {
                    delete accountTokenTransactions[address]
                }
                else {
                    accountTokenTransactions[address] = ownerTokenTransactions
                }

                const updatedState: Partial<AccountControllerState> = {
                    accountTokenTransactions,
                }

                await this.updateHiddenAdditionalAssets(address, params)
                const assetsList = await this.addAdditionalAssets(await accountsStorage.getAccount(address))
                if (assetsList != null) {
                    const { accountEntries } = this.state

                    accountEntries[assetsList.tonWallet.address] = assetsList
                    updatedState.accountEntries = accountEntries
                }

                this.update(updatedState)
            })
        }
        catch (e: any) {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
        }
    }

    protected async updateHiddenAdditionalAssets(address: string, params: TokenWalletsToUpdate): Promise<void> {
        try {
            const { storage, connectionController } = this.config
            const group = connectionController.state.selectedConnection.group
            const updatedTokenRoots = Object.entries(params)
                .filter(([tokenRoot, visible]) => !visible
                && connectionController.connectionConfig.blockchainsByGroup[group]?.defaultActiveAssets?.find(
                    ({ address }) => tokenRoot === address,
                ))
                .map(([tokenRoot]) => tokenRoot)

            if (updatedTokenRoots.length > 0) {
                const hiddenAdditionalAssets = await storage.get('hiddenAdditionalAssets')
                const hiddenTokenRoots = hiddenAdditionalAssets?.[address]?.[group] ?? []
                const newHiddenTokenRoots = updatedTokenRoots.filter(tokenRoot => !hiddenTokenRoots.includes(tokenRoot))

                if (newHiddenTokenRoots.length > 0) {
                    await storage.set({
                        hiddenAdditionalAssets: {
                            ...hiddenAdditionalAssets,
                            [address]: {
                                ...hiddenAdditionalAssets?.[address],
                                [group]: [
                                    ...hiddenTokenRoots,
                                    ...newHiddenTokenRoots,
                                ],
                            },
                        },
                    })
                }
            }
        }
        catch (e) {
            log.error('updateHiddenAdditionalAssets', e)
        }
    }

    public async logOut() {
        log.trace('logOut')
        await this._accountsMutex.use(async () => {
            log.trace('logOut -> mutex gained')
            const { accountsStorage, keyStore, storage } = this.config

            await this._stopSubscriptions()
            await accountsStorage.clear()
            await keyStore.clear()
            await storage.remove([
                'selectedAccountAddress',
                'selectedMasterKey',
                'masterKeysNames',
                'accountsVisibility',
                'recentMasterKeys',
                'externalAccounts',
                'knownTokens',
                'accountPendingTransactions',
            ])
            this.update(cloneDeep(defaultState), true)

            log.trace('logOut -> mutex released')
        })
    }

    public async createMasterKey(
        { name, password, seed, select }: MasterKeyToCreate,
        userMnemonic?: UserMnemonic,
    ): Promise<nt.KeyStoreEntry> {
        const { keyStore } = this.config

        try {
            let newKey: nt.NewKey
            if (userMnemonic === 'TONTypesWallet' || userMnemonic === 'TONBip39' || seed.mnemonicType.type !== 'bip39') {
                newKey = {
                    type: 'encrypted_key',
                    data: {
                        password,
                        phrase: seed.phrase,
                        mnemonicType: seed.mnemonicType,
                    },
                }
            }
            else {
                newKey = {
                    type: 'master_key',
                    data: {
                        password,
                        params: {
                            phrase: seed.phrase,
                        },
                    },
                }
            }

            const entry = await keyStore.addKey(newKey)

            if (name !== undefined) {
                await this.updateMasterKeyName(entry.masterKey, name)
            }

            this.update({
                storedKeys: {
                    ...this.state.storedKeys,
                    [entry.publicKey]: entry,
                },
            })

            if (select) {
                await this.selectMasterKey(entry.masterKey)
            }

            return entry
        }
        catch (e: any) {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
        }
    }

    public async selectMasterKey(masterKey: string) {
        if (this.state.selectedMasterKey === masterKey) return

        this._disableIntensivePolling() // pause all subscriptions

        this.update({
            selectedMasterKey: masterKey,
        })

        await this.startSubscriptions() // create and start only current master key's subscriptions
        await this._saveSelectedMasterKey()
    }

    public async exportSeed(exportKey: nt.ExportSeed): Promise<nt.ExportedSeed> {
        return this.config.keyStore.exportSeed(exportKey)
    }

    public async updateMasterKeyName(masterKey: string, name: string): Promise<void> {
        this.update({
            masterKeysNames: {
                ...this.state.masterKeysNames,
                [masterKey]: name,
            },
        })

        await this._saveMasterKeysNames()
    }

    public async updateRecentMasterKey(masterKey: nt.KeyStoreEntry): Promise<void> {
        let recentMasterKeys = this.state.recentMasterKeys.slice()

        recentMasterKeys = recentMasterKeys.filter(key => key.masterKey !== masterKey.masterKey)
        recentMasterKeys.unshift(masterKey)
        recentMasterKeys = recentMasterKeys.slice(0, 5)

        this.update({
            recentMasterKeys,
        })

        await this._saveRecentMasterKeys()
    }

    public async getPublicKeys(params: nt.GetPublicKeys): Promise<string[]> {
        const { keyStore } = this.config

        try {
            const publicKeys = await keyStore.getPublicKeys(params)

            return publicKeys
        }
        catch (e: any) {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
        }
    }

    public async createDerivedKey(data: KeyToDerive): Promise<nt.KeyStoreEntry> {
        const entry = await this._createDerivedKey(data)

        this.update({
            storedKeys: {
                ...this.state.storedKeys,
                [entry.publicKey]: entry,
            },
        })

        return entry
    }

    public async createDerivedKeys(data: KeyToDerive[]): Promise<nt.KeyStoreEntry[]> {
        const storedKeys = { ...this.state.storedKeys }

        const entries = await Promise.all(
            data.map(async item => {
                const entry = await this._createDerivedKey(item)
                storedKeys[entry.publicKey] = entry
                return entry
            }),
        )

        this.update({
            storedKeys,
        })

        return entries
    }

    public async updateDerivedKeyName(entry: nt.KeyStoreEntry): Promise<void> {
        const { signerName, masterKey, publicKey, name } = entry

        let params: nt.RenameKey
        switch (signerName) {
            case 'master_key': {
                params = {
                    type: 'master_key',
                    data: {
                        masterKey,
                        publicKey,
                        name,
                    },
                }
                break
            }
            case 'encrypted_key': {
                params = {
                    type: 'encrypted_key',
                    data: {
                        publicKey,
                        name,
                    },
                }
                break
            }
            case 'ledger_key': {
                params = {
                    type: 'ledger_key',
                    data: {
                        publicKey,
                        name,
                    },
                }
                break
            }
            default:
                return
        }

        const newEntry = await this.config.keyStore.renameKey(params)

        this.update({
            storedKeys: {
                ...this.state.storedKeys,
                [publicKey]: newEntry,
            },
        })
    }

    public async createLedgerKey({ accountId, name }: LedgerKeyToCreate): Promise<nt.KeyStoreEntry> {
        const { keyStore } = this.config

        try {
            const entry = await keyStore.addKey({
                type: 'ledger_key',
                data: {
                    name,
                    accountId,
                },
            })

            this.update({
                storedKeys: {
                    ...this.state.storedKeys,
                    [entry.publicKey]: entry,
                },
            })

            return entry
        }
        catch (e: any) {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
        }
    }

    public async removeMasterKey(masterKey: string): Promise<void> {
        await this.batch(async () => {
            const { storedKeys, accountEntries, recentMasterKeys } = this.state
            const keysToRemove = Object.values(storedKeys)
                .filter(key => key.masterKey === masterKey)
                .map<KeyToRemove>(({ publicKey }) => ({ publicKey }))
            const accountsToRemove = Object.values(accountEntries)
                .filter(account => keysToRemove.some(key => key.publicKey === account.tonWallet.publicKey))
                .map(account => account.tonWallet.address)

            await this.removeAccounts(accountsToRemove)
            await this.removeKeys(keysToRemove)

            this.update({
                recentMasterKeys: recentMasterKeys.filter(key => key.masterKey !== masterKey),
            })

            await this._saveRecentMasterKeys()
        })
    }

    public async removeKey({ publicKey }: KeyToRemove): Promise<nt.KeyStoreEntry | undefined> {
        const entry = await this._removeKey({ publicKey })
        const storedKeys = { ...this.state.storedKeys }
        delete storedKeys[publicKey]

        this.update({
            storedKeys,
        })

        return entry
    }

    public async removeKeys(data: KeyToRemove[]): Promise<Array<nt.KeyStoreEntry | undefined>> {
        const storedKeys = { ...this.state.storedKeys }
        const entries = await Promise.all(
            data.map(async item => {
                const entry = await this._removeKey(item)
                delete storedKeys[item.publicKey]
                return entry
            }),
        )

        this.update({
            storedKeys,
        })

        return entries
    }

    public getLedgerMasterKey() {
        const { ledgerBridge } = this.config
        return ledgerBridge.getPublicKey(0)
            .then((publicKey) => Buffer.from(publicKey).toString('hex'))
    }

    public getLedgerFirstPage() {
        const { ledgerBridge } = this.config
        return ledgerBridge.getFirstPage()
    }

    public getLedgerNextPage() {
        const { ledgerBridge } = this.config
        return ledgerBridge.getNextPage()
    }

    public getLedgerPreviousPage() {
        const { ledgerBridge } = this.config
        return ledgerBridge.getPreviousPage()
    }

    public getLedgerPage(page: number) {
        const { ledgerBridge } = this.config
        return ledgerBridge.getLedgerPage(page)
    }

    public getLedgerAddress(account: nt.AssetsList) {
        const { ledgerBridge, nekoton } = this.config
        const { storedKeys } = this.state
        const key = storedKeys[account.tonWallet.publicKey]
        const contract = nekoton.getContractTypeNumber(account.tonWallet.contractType)

        if (!key || key.signerName !== 'ledger_key') {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, 'Invalid account')
        }

        return ledgerBridge.getAddress(key.accountId, contract)
            .then((address) => Buffer.from(address).toString('hex'))
    }

    public async createAccount(params: nt.AccountToAdd, select: boolean): Promise<nt.AssetsList> {
        const { accountsStorage } = this.config

        try {
            const selectedAccount = await this.addAdditionalAssets(await accountsStorage.addAccount(params))

            const accountEntries = {
                ...this.state.accountEntries,
                [selectedAccount.tonWallet.address]: selectedAccount,
            }

            await this.updateAccountVisibility(selectedAccount.tonWallet.address, true)

            if (select) {
                this.update({
                    accountEntries,
                    selectedAccountAddress: selectedAccount.tonWallet.address,
                })
            }
            else {
                this.update({
                    accountEntries,
                })
            }

            await this._saveSelectedAccountAddress()
            await this.startSubscriptions()

            return selectedAccount
        }
        catch (e: any) {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
        }
    }

    public async createAccounts(accounts: nt.AccountToAdd[]): Promise<nt.AssetsList[]> {
        const { accountsStorage } = this.config

        try {
            const newAccounts = await this.addAdditionalAssets(await accountsStorage.addAccounts(accounts))

            const accountEntries = { ...this.state.accountEntries }
            const accountsVisibility: { [address: string]: boolean } = {}
            for (const account of newAccounts) {
                accountsVisibility[account.tonWallet.address] = true
                accountEntries[account.tonWallet.address] = account
            }

            this.update({
                accountEntries,
                accountsVisibility: {
                    ...this.state.accountsVisibility,
                    ...accountsVisibility,
                },
            })

            await this._saveAccountsVisibility()
            await this.startSubscriptions()

            return newAccounts
        }
        catch (e: any) {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
        }
    }

    public async ensureAccountSelected() {
        const { accountsStorage, storage, connectionController } = this.config
        const selectedAccountAddress = await storage.get('selectedAccountAddress')
        if (selectedAccountAddress) {
            const selectedAccount = await accountsStorage.getAccount(
                selectedAccountAddress,
            )
            if (selectedAccount) {
                return
            }
        }

        const storedKeys = await this._getStoredKeys()
        const entries = await this.addAdditionalAssets(
            (await accountsStorage.getStoredAccounts()).filter(
                ({ tonWallet }) => !!storedKeys[tonWallet.publicKey],
            ),
        )

        if (entries.length === 0) {
            throw new Error('No accounts')
        }

        const contractType = await connectionController.use(
            async ({ network }) => getDefaultContractType(network, connectionController.connectionConfig),
        )
        const selectedAccount = entries.find(
            (item) => item.tonWallet.contractType === contractType,
        ) || entries[0]

        const externalAccounts = await storage.get('externalAccounts') ?? []

        let selectedMasterKey = await storage.get('selectedMasterKey')
        if (!selectedMasterKey) {
            selectedMasterKey = storedKeys[selectedAccount.tonWallet.publicKey]?.masterKey

            if (!selectedMasterKey) {
                const { address } = selectedAccount.tonWallet
                for (const externalAccount of externalAccounts) {
                    if (externalAccount.address !== address) {
                        continue
                    }

                    const externalIn = externalAccount.externalIn[0] as string | undefined
                    if (externalIn != null) {
                        selectedMasterKey = storedKeys[externalIn]?.masterKey
                    }
                    break
                }
            }
        }

        await this.selectMasterKey(selectedMasterKey)

        this.update({
            selectedAccountAddress: selectedAccount.tonWallet.address,
        })

        await this._saveSelectedAccountAddress()
    }

    public async selectFirstAccount(): Promise<void> {
        const { storedKeys, accountEntries, accountsVisibility, selectedMasterKey } = this.state

        if (selectedMasterKey) {
            const keys = new Set(
                Object.values(storedKeys)
                    .filter(({ masterKey }) => masterKey === selectedMasterKey)
                    .map(({ publicKey }) => publicKey),
            )
            const accounts = Object.values(accountEntries).filter(({ tonWallet }) => keys.has(tonWallet.publicKey))
            const account = accounts.find(
                ({ tonWallet }) => accountsVisibility[tonWallet.address] !== false,
            ) ?? accounts.at(0)

            if (account) {
                await this.selectAccount(account.tonWallet.address)
                return
            }
        }

        const accounts = Object.values(accountEntries).filter(
            ({ tonWallet }) => !!storedKeys[tonWallet.publicKey],
        )
        const account = accounts.find(
            ({ tonWallet }) => accountsVisibility[tonWallet.address] !== false,
        ) ?? accounts.at(0)
        const key = account ? storedKeys[account.tonWallet.publicKey] : Object.values(storedKeys).at(0)

        if (key) {
            await this.selectMasterKey(key.masterKey)
        }
        else {
            throw new NekotonRpcError(
                RpcErrorCode.INVALID_REQUEST,
                'No keys found',
            )
        }

        if (account && account.tonWallet.publicKey === key.publicKey) {
            await this.selectAccount(account.tonWallet.address)
        }
        else {
            this.update({ selectedAccountAddress: undefined })
            await this._saveSelectedAccountAddress()
        }
    }

    public async addExternalAccount(
        address: string,
        publicKey: string,
        externalPublicKey: string,
    ): Promise<void> {
        let { externalAccounts } = this.state
        const entry = externalAccounts.find(account => account.address === address)

        if (entry == null) {
            externalAccounts.unshift({ address, publicKey, externalIn: [externalPublicKey] })
            this.update({
                externalAccounts,
            })
            await this._saveExternalAccounts()
            return
        }

        if (!entry.externalIn.includes(externalPublicKey)) {
            entry.externalIn.push(externalPublicKey)
        }

        externalAccounts = externalAccounts.filter(account => account.address !== address)
        externalAccounts.unshift(entry)

        this.update({
            externalAccounts,
        })

        await this._saveExternalAccounts()
    }

    public async selectAccount(address: string) {
        log.trace('selectAccount')

        await this._accountsMutex.use(async () => {
            log.trace('selectAccount -> mutex gained')

            await this._selectAccount(address)

            log.trace('selectAccount -> mutex released')
        })
    }

    public async removeAccount(address: string) {
        await this._accountsMutex.use(async () => {
            await this.config.accountsStorage.removeAccount(address)

            const subscription = this._everWalletSubscriptions.get(address)
            this._everWalletSubscriptions.delete(address)
            if (subscription != null) {
                await subscription.stop()
            }

            const tokenSubscriptions = this._tokenWalletSubscriptions.get(address)
            this._tokenWalletSubscriptions.delete(address)
            if (tokenSubscriptions != null) {
                await Promise.all(
                    Array.from(tokenSubscriptions.values()).map(item => item.stop()),
                )
            }

            const jettonSubscriptions = this._jettonWalletSubscriptions.get(address)
            this._jettonWalletSubscriptions.delete(address)
            if (jettonSubscriptions != null) {
                await Promise.all(
                    Array.from(jettonSubscriptions.values()).map(item => item.stop()),
                )
            }

            const accountEntries = { ...this.state.accountEntries }
            delete accountEntries[address]

            const accountContractStates = { ...this.state.accountContractStates }
            delete accountContractStates[address]

            const accountCustodians = { ...this.state.accountCustodians }
            delete accountCustodians[address]

            const accountDetails = { ...this.state.accountDetails }
            delete accountDetails[address]

            const accountTransactions = { ...this.state.accountTransactions }
            delete accountTransactions[address]

            const accountTokenTransactions = { ...this.state.accountTokenTransactions }
            delete accountTokenTransactions[address]

            const { selectedAccountAddress, selectedMasterKey, accountsVisibility } = this.state
            let accountToSelect: nt.AssetsList | undefined

            if (selectedAccountAddress === address && selectedMasterKey) {
                const accounts = this._getAccountsByMasterKey(selectedMasterKey).filter(
                    ({ tonWallet }) => tonWallet.address !== address,
                )

                accountToSelect = accounts.find(
                    ({ tonWallet }) => accountsVisibility[tonWallet.address],
                ) ?? accounts[0] // just in case
            }

            await this.batch(async () => {
                if (accountToSelect) {
                    await this._selectAccount(accountToSelect.tonWallet.address)
                }

                this.update({
                    accountEntries,
                    accountContractStates,
                    accountCustodians,
                    accountDetails,
                    accountTransactions,
                    accountTokenTransactions,
                })
            })
        })
    }

    public async removeAccounts(addresses: string[]) {
        return Promise.all(addresses.map(address => this.removeAccount(address)))
    }

    public async renameAccount(address: string, name: string): Promise<void> {
        await this._accountsMutex.use(async () => {
            const accountEntry = await this.addAdditionalAssets(
                await this.config.accountsStorage.renameAccount(address, name),
            )

            this.update({
                accountEntries: {
                    ...this.state.accountEntries,
                    [address]: accountEntry,
                },
            })
        })
    }

    public async updateAccountVisibility(address: string, value: boolean): Promise<void> {
        this.update({
            accountsVisibility: {
                ...this.state.accountsVisibility,
                [address]: value,
            },
        })

        await this._saveAccountsVisibility()
    }

    public async checkPassword(password: nt.KeyPassword) {
        if (password.type === 'ledger_key') {
            return Promise.resolve(true)
        }

        return this.config.keyStore.check_password(password)
    }

    public changeKeyPassword(password: nt.ChangeKeyPassword) {
        return this.config.keyStore.changeKeyPassword(password)
    }

    public async isPasswordCached(publicKey: string): Promise<boolean> {
        return this.config.keyStore.isPasswordCached(publicKey)
    }

    public async getFeeFactors(isMasterchain: boolean): Promise<nt.FeeFactors> {
        return this.config.connectionController.use(async ({ data: { transport }}) => {
            try {
                return await transport.getFeeFactors(isMasterchain)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
        })
    }

    public async estimateFees(
        address: string,
        params: TransferMessageToPrepare,
        executionOptions: nt.TransactionExecutionOptions,
    ) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        return subscription.use(async wallet => {
            const contractState = await wallet.getContractState()
            if (contractState == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    `Failed to get contract state for ${address}`,
                )
            }

            const unsignedMessage = wallet.prepareTransfer(
                contractState,
                params.publicKey,
                60,
                [{
                    destination: params.recipient,
                    amount: params.amount,
                    bounce: false,
                    body: params.payload ?? '',
                }],
            )
            if (unsignedMessage == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    'Contract must be deployed first',
                )
            }

            try {
                const signedMessage = unsignedMessage.signFake()
                return await wallet.estimateFees(signedMessage, executionOptions)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage.free()
            }
        })
    }

    public async estimateConfirmationFees(address: string, params: ConfirmMessageToPrepare) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        return subscription.use(async wallet => {
            const contractState = await wallet.getContractState()
            if (contractState == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    `Failed to get contract state for ${address}`,
                )
            }

            const unsignedMessage = wallet.prepareConfirm(
                contractState,
                params.publicKey,
                params.transactionId,
                60,
            )

            try {
                const signedMessage = unsignedMessage.signFake()
                return await wallet.estimateFees(signedMessage, {})
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage.free()
            }
        })
    }

    public async estimateDeploymentFees(address: string): Promise<string> {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        return subscription.use(async wallet => {
            const unsignedMessage = wallet.prepareDeploy(60)
            try {
                const signedMessage = unsignedMessage.signFake()
                return await wallet.estimateFees(signedMessage, {
                    disableSignatureCheck: true,
                    overrideBalance: '100000000000',
                })
            }
            catch (e: any) {
                log.error(e)
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage.free()
            }
        })
    }

    public async simulateTransactionTree(
        address: string,
        message: TransferMessageToPrepare,
        params: TransactionTreeSimulationParams,
    ): Promise<nt.TransactionTreeSimulationError[]> {
        const { connectionController } = this.config

        if (connectionController.state.selectedConnection.network === 'ton') {
            // TON workaround
            return []
        }

        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        const signedMessage = await subscription.use(async wallet => {
            const contractState = await wallet.getContractState()
            if (contractState == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    `Failed to get contract state for ${address}`,
                )
            }

            const unsignedMessage = wallet.prepareTransfer(
                contractState,
                message.publicKey,
                60,
                [{
                    amount: message.amount,
                    destination: message.recipient,
                    bounce: false,
                    body: message.payload,
                }],
            )
            if (unsignedMessage == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    'Contract must be deployed first',
                )
            }

            try {
                return unsignedMessage.signFake()
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage.free()
            }
        })

        const { ignoredComputePhaseCodes, ignoredActionPhaseCodes } = params
        const computePhaseCodes = ignoredComputePhaseCodes?.filter(e => !e.address).map(e => e.code) ?? []
        const actionPhaseCodes = ignoredActionPhaseCodes?.filter(e => !e.address).map(e => e.code) ?? []

        const icpc = Int32Array.from([0, 1, 60, 100, ...computePhaseCodes]) // ignored_compute_phase_codes
        const iapc = Int32Array.from([0, 1, ...actionPhaseCodes]) // ignored_action_phase_codes
        let errors = await connectionController.use(
            ({ data: { transport }}) => transport.simulateTransactionTree(signedMessage, icpc, iapc).catch((e) => {
                log.error(e)
                return []
            }),
        )

        const shouldIgnore = (
            type: 'compute_phase' | 'action_phase',
            ignore: IgnoreTransactionTreeSimulationError<string>,
            { error, address }: nt.TransactionTreeSimulationError,
        ) => {
            if (error.type !== type) return false
            return ignore.code === error.code && (!ignore.address || ignore.address === address)
        }

        // filter out ignoredComputePhaseCodes by address
        if (ignoredComputePhaseCodes && ignoredComputePhaseCodes.length > 0) {
            errors = errors.filter((error) => !ignoredComputePhaseCodes.some((ignore) => shouldIgnore('compute_phase', ignore, error)))
        }

        // filter out ignoredActionPhaseCodes by address
        if (ignoredActionPhaseCodes && ignoredActionPhaseCodes.length > 0) {
            errors = errors.filter((error) => !ignoredActionPhaseCodes.some((ignore) => shouldIgnore('action_phase', ignore, error)))
        }


        return uniqWith(errors, (a, b) => {
            if (a.address !== b.address) return false
            if (a.error.type !== b.error.type) return false
            return !(hasErrorCode(a.error) && hasErrorCode(b.error) && a.error.code !== b.error.code)
        })
    }

    public async simulateConfirmationTransactionTree(
        address: string,
        params: ConfirmMessageToPrepare,
    ): Promise<nt.TransactionTreeSimulationError[]> {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        const signedMessage = await subscription.use(async wallet => {
            const contractState = await wallet.getContractState()
            if (contractState == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    `Failed to get contract state for ${address}`,
                )
            }

            const unsignedMessage = wallet.prepareConfirm(
                contractState,
                params.publicKey,
                params.transactionId,
                60,
            )

            try {
                return unsignedMessage.signFake()
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage.free()
            }
        })

        const icpc = Int32Array.from([0, 1, 60, 100]) // ignored_compute_phase_codes
        const iapc = Int32Array.from([0, 1]) // ignored_action_phase_codes
        const errors = await this.config.connectionController.use(
            ({ data: { transport }}) => transport.simulateTransactionTree(signedMessage, icpc, iapc),
        )

        return uniqWith(errors, (a, b) => {
            if (a.address !== b.address) return false
            if (a.error.type !== b.error.type) return false
            return !(hasErrorCode(a.error) && hasErrorCode(b.error) && a.error.code !== b.error.code)
        })
    }

    public async getMultisigPendingTransactions(address: string) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        return subscription.use(async wallet => {
            try {
                return wallet.getMultisigPendingTransactions()
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
        })
    }

    public async prepareTransferMessage(
        address: string,
        params: TransferMessageToPrepare,
        password: nt.KeyPassword,
    ) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        return subscription.use(async wallet => {
            const contractState = await wallet.getContractState()
            if (contractState == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    `Failed to get contract state for ${address}`,
                )
            }

            const unsignedMessage = wallet.prepareTransfer(
                contractState,
                params.publicKey,
                60,
                [{
                    destination: params.recipient,
                    amount: params.amount,
                    bounce: false,
                    body: params.payload ?? '',
                }],
            )
            if (unsignedMessage == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    'Contract must be deployed first',
                )
            }

            try {
                return await this.signPreparedMessage(unsignedMessage, password)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage.free()
            }
        })
    }

    public async prepareConfirmMessage(
        address: string,
        params: ConfirmMessageToPrepare,
        password: nt.KeyPassword,
    ) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        return subscription.use(async wallet => {
            const contractState = await wallet.getContractState()
            if (contractState == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    `Failed to get contract state for ${address}`,
                )
            }

            let unsignedMessage: nt.UnsignedMessage | undefined
            try {
                unsignedMessage = wallet.prepareConfirm(
                    contractState,
                    params.publicKey,
                    params.transactionId,
                    60,
                )

                return await this.signPreparedMessage(unsignedMessage, password)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage?.free()
            }
        })
    }

    public async prepareDeploymentMessage(
        address: string,
        params: DeployMessageToPrepare,
        password: nt.KeyPassword,
    ) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        return subscription.use(async wallet => {
            const contractState = await wallet.getContractState()
            if (contractState == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.RESOURCE_UNAVAILABLE,
                    `Failed to get contract state for ${address}`,
                )
            }

            let unsignedMessage: nt.UnsignedMessage
            if (params.type === 'single_owner') {
                unsignedMessage = wallet.prepareDeploy(60)
            }
            else {
                unsignedMessage = wallet.prepareDeployWithMultipleOwners(
                    60,
                    params.custodians,
                    params.reqConfirms,
                    params.expirationTime,
                )
            }

            try {
                return await this.signPreparedMessage(unsignedMessage, password)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
            finally {
                unsignedMessage.free()
            }
        })
    }

    public async prepareTokenMessage(
        owner: string,
        rootTokenContract: string,
        params: TokenMessageToPrepare,
    ) {
        const subscription = await this._getOrCreateTokenWalletSubscription(owner, rootTokenContract)
        requireTokenWalletSubscription(owner, rootTokenContract, subscription)

        return subscription.use(async wallet => {
            let attachedAmount: string | undefined
            try {
                attachedAmount = await wallet.estimateMinAttachedAmount(
                    params.recipient,
                    params.amount,
                    params.payload || '',
                    params.notifyReceiver,
                )
            }
            catch (e) {
                log.error(e)
            }

            try {
                return await wallet.prepareTransfer(
                    params.recipient,
                    params.amount,
                    params.payload || '',
                    params.notifyReceiver,
                    attachedAmount,
                )
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
        })
    }

    public async verifySignature(
        publicKey: string,
        dataHash: string,
        signature: string,
        withSignatureId: number | boolean = true,
    ) {
        const { nekoton } = this.config
        const signatureId = await this._computeSignatureId(withSignatureId)

        const key = this.state.storedKeys[publicKey] as nt.KeyStoreEntry | undefined
        if (key?.signerName === 'ledger_key') {
            let data: string
            const prefix = Buffer.from([0xff, 0xff, 0xff, 0xff])
            if (/^[0-9A-Fa-f]+$/.test(dataHash)) {
                const bytes = Buffer.from(dataHash, 'hex')
                // conflict between `buffer` package and `@types/node`
                data = Buffer.concat([prefix, bytes] as any).toString('hex')
            }
            else {
                const bytes = Buffer.from(dataHash, 'base64')
                // conflict between `buffer` package and `@types/node`
                data = Buffer.concat([prefix, bytes] as any).toString('base64')
            }

            return nekoton.verifyLedgerSignature(publicKey, data, signature, signatureId)
        }

        return nekoton.verifySignature(publicKey, dataHash, signature, signatureId)
    }


    public async prepareJettonMessage(
        owner: string,
        rootTokenContract: string,
        params: TokenMessageToPrepare,
    ) {
        const subscription = await this._getOrCreateJettonWalletSubscription(owner, rootTokenContract)
        requireJettonWalletSubscription(owner, rootTokenContract, subscription)

        return subscription.use(async wallet => {
            let attachedAmount: string | undefined
            try {
                attachedAmount = await wallet.estimateMinAttachedAmount(params.recipient)
            }
            catch (e) {
                log.error(e)
            }

            try {
                return await wallet.prepareTransfer(
                    params.amount,
                    params.recipient,
                    owner,
                    '',
                    '1',
                    params.payload || '',
                    attachedAmount,
                )
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, e.toString())
            }
        })
    }

    public async signData(
        data: string,
        password: nt.KeyPassword,
        withSignatureId: number | boolean = true,
    ) {
        const signatureId = await this._computeSignatureId(withSignatureId)
        return this.config.keyStore.signData(data, password, signatureId)
    }

    public async signDataRaw(
        data: string,
        password: nt.KeyPassword,
        withSignatureId: number | boolean = true,
    ) {
        const signatureId = await this._computeSignatureId(withSignatureId)
        return this.config.keyStore.signDataRaw(data, password, signatureId)
    }

    public async signPreparedMessage(
        unsignedMessage: nt.UnsignedMessage,
        password: nt.KeyPassword,
        withSignatureId: number | boolean = true,
    ) {
        const signatureId = await this._computeSignatureId(withSignatureId)
        return this.config.keyStore.sign(unsignedMessage, password, signatureId)
    }

    public async encryptData(
        data: string,
        recipientPublicKeys: string[],
        algorithm: nt.EncryptionAlgorithm,
        password: nt.KeyPassword,
    ) {
        return this.config.keyStore.encryptData(data, recipientPublicKeys, algorithm, password)
    }

    public async decryptData(data: nt.EncryptedData, password: nt.KeyPassword) {
        return this.config.keyStore.decryptData(data, password)
    }

    public async sendMessage(
        address: string,
        { signedMessage, info }: WalletMessageToSend,
    ): Promise<() => Promise<nt.Transaction | undefined>> {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        let accountMessageRequests = await this._sendMessageRequests.get(address)
        if (!accountMessageRequests) {
            accountMessageRequests = new Map()
            this._sendMessageRequests.set(address, accountMessageRequests)
        }

        let callback: SendMessageCallback
        const promise = new Promise<nt.Transaction | undefined>((resolve, reject) => {
            callback = {
                resolve: (tx) => resolve(tx),
                reject: (e) => reject(e),
            }
        })

        const id = signedMessage.hash
        accountMessageRequests.set(id, callback!)

        try {
            await subscription.prepareReliablePolling()
            await this.useEverWallet(address, async wallet => {
                try {
                    const pendingTransaction = await wallet.sendMessage(signedMessage)

                    if (info != null) {
                        this._addPendingTransaction(address, info, pendingTransaction)
                    }

                    subscription.skipRefreshTimer(wallet.pollingMethod)
                }
                catch (e: any) {
                    throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, e.toString())
                }
            })
        }
        catch (e: any) {
            this._rejectMessageRequest(address, id, e)
            throw e
        }

        return () => promise
    }

    public async preloadTransactions(address: string, lt: string) {
        const subscription = await this._getOrCreateEverWalletSubscription(address)
        requireEverWalletSubscription(address, subscription)

        await subscription.use(async wallet => {
            try {
                await wallet.preloadTransactions(lt)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, e.toString())
            }
        })
    }

    public async preloadTokenTransactions(owner: string, rootTokenContract: string, lt: string) {
        const network = await this.config.connectionController.use(
            async ({ network }) => network,
        )
        const subscription = network === 'ton'
            ? await this._getOrCreateJettonWalletSubscription(owner, rootTokenContract)
            : await this._getOrCreateTokenWalletSubscription(owner, rootTokenContract)

        if (!subscription) {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                `There is no token wallet subscription for address ${owner} for root ${rootTokenContract}`,
            )
        }

        await subscription.use(async wallet => {
            try {
                await wallet.preloadTransactions(lt)
            }
            catch (e: any) {
                throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, e.toString())
            }
        })
    }

    public enableIntensivePolling() {
        log.trace('Enable intensive polling')
        this._intensivePollingEnabled = true
        this._enableIntensivePolling()
    }

    public disableIntensivePolling() {
        log.trace('Disable intensive polling')
        this._intensivePollingEnabled = false
        this._disableIntensivePolling()
    }

    public addTransactionsListener(listener: ITransactionsListener) {
        this._transactionsListeners.push(listener)
    }

    public removeTransactionsListener(listener: ITransactionsListener) {
        const index = this._transactionsListeners.indexOf(listener)

        if (index > -1) {
            this._transactionsListeners.splice(index, 1)
        }

        return index > -1
    }

    public async updateContractState(addresses: string[]): Promise<void> {
        await this._accountsMutex.use(async () => {
            const { accountEntries } = this.state
            return Promise.all(addresses.map(async (address) => {
                const account = accountEntries[address]
                let subscription = this._everWalletSubscriptions.get(address)

                if (!subscription && account) {
                    subscription = await this._createEverWalletSubscription(
                        account.tonWallet.address,
                        account.tonWallet.publicKey,
                        account.tonWallet.contractType,
                    )
                }

                subscription?.skipRefreshTimer()
            }))
        })
    }

    public async getTokenBalance(owner: string, rootTokenContract: string): Promise<string> {
        const { selectedConnection } = this.config.connectionController.state

        if (selectedConnection.network === 'ton') {
            const subscription = await this._getOrCreateJettonWalletSubscription(owner, rootTokenContract)
            requireJettonWalletSubscription(owner, rootTokenContract, subscription)
            return subscription.use(async (wallet) => {
                await wallet.refresh()
                return wallet.balance
            })
        }

        const subscription = await this._getOrCreateTokenWalletSubscription(owner, rootTokenContract)
        requireTokenWalletSubscription(owner, rootTokenContract, subscription)
        return subscription.use(async (wallet) => {
            await wallet.refresh()
            return wallet.balance
        })
    }

    public async exportKeyPair(password: nt.KeyPassword): Promise<nt.KeyPair> {
        return this.config.keyStore.exportKeyPair(password)
    }

    private async _selectAccount(address: string) {
        const selectedAccount = this.state.accountEntries[address]

        if (selectedAccount) {
            this.update({
                selectedAccountAddress: selectedAccount.tonWallet.address,
                accountsVisibility: {
                    ...this.state.accountsVisibility,
                    [address]: true,
                },
            })

            await this._saveSelectedAccountAddress()
            await this._saveAccountsVisibility()
        }
    }

    private async _createEverWalletSubscription(
        address: string,
        publicKey: string,
        contractType: nt.ContractType,
    ): Promise<EverWalletSubscription> {
        let subscription = this._everWalletSubscriptions.get(address)

        if (subscription) return subscription

        class EverWalletHandler implements IEverWalletHandler {

            private readonly _address: string

            private readonly _controller: AccountController

            private _walletDetails: nt.TonWalletDetails

            constructor(
                address: string,
                controller: AccountController,
                contractType: nt.ContractType,
            ) {
                this._address = address
                this._controller = controller
                this._walletDetails = controller.config.nekoton.getContractTypeDefaultDetails(contractType)
            }

            onMessageExpired(pendingTransaction: nt.PendingTransaction) {
                this._controller._removePendingTransactions(
                    this._address,
                    [pendingTransaction.messageHash],
                )
                this._controller._resolveMessageRequest(
                    this._address,
                    pendingTransaction.messageHash,
                    undefined,
                )
            }

            onMessageSent(pendingTransaction: nt.PendingTransaction, transaction: nt.Transaction) {
                this._controller._removePendingTransactions(
                    this._address,
                    [pendingTransaction.messageHash],
                )
                this._controller._resolveMessageRequest(
                    this._address,
                    pendingTransaction.messageHash,
                    transaction,
                )
            }

            onStateChanged(newState: nt.ContractState) {
                this._controller._updateEverWalletState(this._address, newState)
            }

            onTransactionsFound(
                transactions: Array<nt.TonWalletTransaction>,
                info: nt.TransactionsBatchInfo,
            ) {
                const batches = this._controller._splitEverTransactionsBatch(this._address, transactions, info)

                for (const { transactions, info } of batches) {
                    this._controller._updateTransactions(
                        this._address,
                        this._walletDetails,
                        transactions,
                        info,
                    )

                    this._controller._transactionsListeners.forEach((listener) => listener.onEverTransactionsFound?.(
                        this._address,
                        this._walletDetails,
                        transactions,
                        info,
                    ))
                }
            }

            onUnconfirmedTransactionsChanged(
                unconfirmedTransactions: nt.MultisigPendingTransaction[],
            ) {
                this._controller._updateUnconfirmedTransactions(
                    this._address,
                    unconfirmedTransactions,
                )
            }

            onCustodiansChanged(custodians: string[]) {
                this._controller._updateCustodians(this._address, custodians)
            }

            onDetailsChanged(details: nt.TonWalletDetails) {
                this._walletDetails = details
                this._controller._updateAccountDetails(this._address, details)
            }

        }

        const handler = new EverWalletHandler(address, this, contractType)

        log.trace('_createEverWalletSubscription -> subscribing to EVER wallet')
        if (isFromZerostate(address)) {
            subscription = await EverWalletSubscription.subscribeByAddress(
                this.config.clock,
                this.config.connectionController,
                address,
                handler,
            )
        }
        else {
            subscription = await EverWalletSubscription.subscribe(
                this.config.clock,
                this.config.connectionController,
                this.config.nekoton.extractAddressWorkchain(address),
                publicKey,
                contractType,
                handler,
            )
        }
        log.trace('_createEverWalletSubscription -> subscribed to EVER wallet')

        this._everWalletSubscriptions.set(address, subscription)
        subscription.setPollingInterval(BACKGROUND_POLLING_INTERVAL)

        await subscription.start()
        return subscription
    }

    private async _createDerivedKey({
        accountId,
        masterKey,
        name,
        password,
    }: KeyToDerive): Promise<nt.KeyStoreEntry> {
        const { keyStore } = this.config

        return keyStore
            .addKey({
                type: 'master_key',
                data: {
                    name,
                    password,
                    params: { masterKey, accountId },
                },
            })
            .catch(e => {
                throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
            })
    }

    private async _removeKey({ publicKey }: KeyToRemove): Promise<nt.KeyStoreEntry | undefined> {
        const { keyStore } = this.config

        return keyStore.removeKey(publicKey).catch(e => {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, e.toString())
        })
    }

    private async _getEverWalletInitData(address: string): Promise<nt.TonWalletInitData> {
        return this.config.connectionController.use(
            ({ data: { transport }}) => transport.getNativeWalletInitData(address),
        )
    }

    private async _createTokenWalletSubscription(
        owner: string,
        rootTokenContract: string,
    ): Promise<TokenWalletSubscription> {
        let ownerSubscriptions = this._tokenWalletSubscriptions.get(owner)
        if (!ownerSubscriptions) {
            ownerSubscriptions = new Map()
            this._tokenWalletSubscriptions.set(owner, ownerSubscriptions)
        }

        let subscription = ownerSubscriptions.get(rootTokenContract)

        if (subscription) return subscription

        class TokenWalletHandler implements ITokenWalletHandler {

            private readonly _owner: string

            private readonly _rootTokenContract: string

            private readonly _controller: AccountController

            constructor(owner: string, rootTokenContract: string, controller: AccountController) {
                this._owner = owner
                this._rootTokenContract = rootTokenContract
                this._controller = controller
            }

            onBalanceChanged(balance: string) {
                this._controller._updateTokenWalletState(
                    this._owner,
                    this._rootTokenContract,
                    balance,
                )
            }

            onTransactionsFound(
                transactions: Array<nt.TokenWalletTransaction>,
                info: nt.TransactionsBatchInfo,
            ) {
                const batches = this._controller._splitTokenTransactionsBatch(
                    this._owner,
                    this._rootTokenContract,
                    transactions,
                    info,
                )

                for (const { transactions, info } of batches) {
                    this._controller._updateTokenTransactions(
                        this._owner,
                        this._rootTokenContract,
                        transactions,
                        info,
                    )

                    this._controller._transactionsListeners.forEach((listener) => listener.onTokenTransactionsFound?.(
                        this._owner,
                        this._rootTokenContract,
                        transactions,
                        info,
                    ))
                }
            }

        }

        log.trace('_createTokenWalletSubscription -> subscribing to token wallet')
        subscription = await TokenWalletSubscription.subscribe(
            this.config.connectionController,
            owner,
            rootTokenContract,
            new TokenWalletHandler(owner, rootTokenContract, this),
        )
        log.trace('_createTokenWalletSubscription -> subscribed to token wallet')

        if (!this.state.knownTokens[rootTokenContract]) {
            await this._updateKnownTokens(rootTokenContract, subscription.symbol)
        }

        ownerSubscriptions.set(rootTokenContract, subscription)
        subscription.setPollingInterval(BACKGROUND_POLLING_INTERVAL)

        await subscription.start()
        return subscription
    }

    private async _createJettonWalletSubscription(
        owner: string,
        rootTokenContract: string,
    ): Promise<JettonWalletSubscription> {
        let ownerSubscriptions = this._jettonWalletSubscriptions.get(owner)
        if (!ownerSubscriptions) {
            ownerSubscriptions = new Map()
            this._jettonWalletSubscriptions.set(owner, ownerSubscriptions)
        }

        let subscription = ownerSubscriptions.get(rootTokenContract)

        if (subscription) return subscription

        class JettonWalletHandler implements IJettonWalletHandler {

            private readonly _owner: string

            private readonly _rootTokenContract: string

            private readonly _controller: AccountController

            constructor(owner: string, rootTokenContract: string, controller: AccountController) {
                this._owner = owner
                this._rootTokenContract = rootTokenContract
                this._controller = controller
            }

            onBalanceChanged(balance: string) {
                this._controller._updateTokenWalletState(
                    this._owner,
                    this._rootTokenContract,
                    balance,
                )
            }

            onTransactionsFound(
                transactions: Array<nt.JettonWalletTransaction>,
                info: nt.TransactionsBatchInfo,
            ) {
                const batches = this._controller._splitJettonTransactionsBatch(
                    this._owner,
                    this._rootTokenContract,
                    transactions,
                    info,
                )

                for (const { transactions, info } of batches) {
                    this._controller._updateJettonTransactions(
                        this._owner,
                        this._rootTokenContract,
                        transactions,
                        info,
                    )

                    this._controller._transactionsListeners.forEach((listener) => listener.onJettonTransactionsFound?.(
                        this._owner,
                        this._rootTokenContract,
                        transactions,
                        info,
                    ))
                }
            }

        }

        log.trace('_createJettonWalletSubscription -> subscribing to jetton wallet')
        subscription = await JettonWalletSubscription.subscribe(
            this.config.connectionController,
            owner,
            rootTokenContract,
            new JettonWalletHandler(owner, rootTokenContract, this),
        )
        log.trace('_createJettonWalletSubscription -> subscribed to jetton wallet')

        const symbol = await this._getJettonSymbol(subscription.details)
        await this._updateKnownTokens(rootTokenContract, symbol)

        ownerSubscriptions.set(rootTokenContract, subscription)
        subscription.setPollingInterval(BACKGROUND_POLLING_INTERVAL)

        await subscription.start()
        return subscription
    }

    private async _getJettonSymbol(details: nt.RootJettonContractDetailsWithAddress): Promise<JettonSymbol> {
        let data: {
            decimals?: number,
            name?: string,
            symbol?: string,
            imageUrl?: string,
        } | undefined

        try {
            const response = await fetch(`${TON_TOKEN_API_BASE_URL}/${details.address}`)
            data = await response.json()
        }
        catch (e) {
            log.error('_getJettonSymbol', e)
        }

        return {
            rootTokenContract: details.address,
            name: data?.symbol ?? details.symbol ?? '',
            fullName: data?.name ?? details.name ?? '',
            decimals: data?.decimals ?? details.decimals ?? 0,
            uri: data?.imageUrl ?? details.uri,
        }
    }

    private async _stopSubscriptions() {
        const stopEverSubscriptions = async () => {
            await Promise.all(
                Array.from(this._everWalletSubscriptions.values()).map(item => item.stop()),
            )
        }

        const stopTokenSubscriptions = async () => {
            await Promise.all(
                Array.from(this._tokenWalletSubscriptions.values()).map(
                    subscriptions => Promise.all(
                        Array.from(subscriptions.values()).map(item => item.stop()),
                    ),
                ),
            )
        }

        const stopJettonSubscriptions = async () => {
            await Promise.all(
                Array.from(this._jettonWalletSubscriptions.values()).map(
                    subscriptions => Promise.all(
                        Array.from(subscriptions.values()).map(item => item.stop()),
                    ),
                ),
            )
        }

        await Promise.all([
            stopEverSubscriptions(),
            stopTokenSubscriptions(),
            stopJettonSubscriptions(),
        ])

        this._everWalletSubscriptions.clear()
        this._tokenWalletSubscriptions.clear()
        this._jettonWalletSubscriptions.clear()
        this._clearSendMessageRequests()

        this.update({
            accountContractStates: {},
            accountTokenStates: {},
            accountTransactions: {},
            accountTokenTransactions: {},
            accountMultisigTransactions: {},
            accountUnconfirmedTransactions: {},
            accountPendingTransactions: {},
        })
    }

    private _clearSendMessageRequests() {
        const rejectionError = new NekotonRpcError(
            RpcErrorCode.RESOURCE_UNAVAILABLE,
            'The request was rejected; please try again',
        )

        const addresses = Array.from(this._sendMessageRequests.keys())
        for (const address of addresses) {
            const ids = Array.from(this._sendMessageRequests.get(address)?.keys() || [])
            for (const id of ids) {
                this._rejectMessageRequest(address, id, rejectionError)
            }
        }
        this._sendMessageRequests.clear()
    }

    private _rejectMessageRequest(address: string, id: string, error: Error) {
        this._deleteMessageRequestAndGetCallback(address, id).reject(error)
    }

    private _resolveMessageRequest(address: string, id: string, transaction?: nt.Transaction) {
        this._deleteMessageRequestAndGetCallback(address, id).resolve(transaction)
    }

    private _deleteMessageRequestAndGetCallback(address: string, id: string): SendMessageCallback {
        const callbacks = this._sendMessageRequests.get(address)?.get(id)
        if (!callbacks) {
            throw new Error(`SendMessage request with id "${id}" not found`)
        }

        this._deleteMessageRequest(address, id)
        return callbacks
    }

    private _deleteMessageRequest(address: string, id: string) {
        const accountMessageRequests = this._sendMessageRequests.get(address)
        if (!accountMessageRequests) {
            return
        }
        accountMessageRequests.delete(id)
        if (accountMessageRequests.size === 0) {
            this._sendMessageRequests.delete(address)
        }
    }

    private _addPendingTransaction(address: string, info: BriefMessageInfo, transaction: nt.PendingTransaction) {
        const { accountPendingTransactions } = this.state
        const update = {
            accountPendingTransactions,
        } as Partial<AccountControllerState>
        const pendingTransactions = getOrInsertDefault(
            accountPendingTransactions,
            address,
        )
        pendingTransactions[transaction.messageHash] = {
            ...info,
            ...transaction,
            createdAt: currentUtime(this.config.clock.offsetMs()),
        } as StoredBriefMessageInfo

        this.update(update)
        this._savePendingTransactions().catch(log.error)
    }

    private _removePendingTransactions(address: string, messageHashes: string[]) {
        const { accountPendingTransactions } = this.state

        const update = {
            accountPendingTransactions,
        } as Partial<AccountControllerState>

        const pendingTransactions = getOrInsertDefault(accountPendingTransactions, address)
        let updated = false

        for (const messageHash of messageHashes) {
            const info = pendingTransactions[messageHash] as StoredBriefMessageInfo | undefined

            if (!info) continue

            delete pendingTransactions[messageHash]
            updated = true
        }

        if (updated) {
            this.update(update)
            this._savePendingTransactions().catch(log.error)
        }
    }

    private _updateEverWalletState(address: string, state: nt.ContractState) {
        const currentStates = this.state.accountContractStates

        const currentState = currentStates[address] as nt.ContractState | undefined
        if (
            currentState?.balance === state.balance
            && currentState?.isDeployed === state.isDeployed
            && currentState?.lastTransactionId?.lt === state.lastTransactionId?.lt
        ) {
            return
        }

        const newStates = {
            ...currentStates,
            [address]: state,
        }
        this.update({
            accountContractStates: newStates,
        })
    }

    private _updateTokenWalletState(owner: string, rootTokenContract: string, balance: string) {
        const { accountTokenStates } = this.state
        const ownerTokenStates = {
            ...accountTokenStates[owner],
            [rootTokenContract]: {
                balance,
            } as TokenWalletState,
        }
        const newBalances = {
            ...accountTokenStates,
            [owner]: ownerTokenStates,
        }
        this.update({
            accountTokenStates: newBalances,
        })
    }

    private _updateTransactions(
        address: string,
        walletDetails: nt.TonWalletDetails,
        transactions: nt.TonWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ) {
        const messagesHashes = transactions.map(transaction => transaction.inMessage.hash)

        this._removePendingTransactions(address, messagesHashes)
        this._updateLastTransaction(address, transactions[0].id)

        const currentTransactions = this.state.accountTransactions
        const accountTransactions = {
            ...currentTransactions,
            [address]: mergeTransactions(currentTransactions[address] || [], transactions, info),
        }

        const update = { accountTransactions } as Partial<AccountControllerState>

        let multisigTransactions = this.state.accountMultisigTransactions[address] as
                | AggregatedMultisigTransactions
                | undefined,
            multisigTransactionsChanged = false

        if (walletDetails.supportsMultipleOwners) {
            // eslint-disable-next-line no-labels
            outer: for (const transaction of transactions) {
                if (transaction.info?.type !== 'wallet_interaction') {
                    continue
                }

                if (transaction.info.data.method.type !== 'multisig') {
                    break
                }

                const method = transaction.info.data.method.data

                switch (method.type) {
                    case 'submit': {
                        const { transactionId } = method.data
                        if (
                            transactionId === '0'
                            || transaction.outMessages.some(msg => msg.dst != null)
                        ) {
                            break outer // eslint-disable-line no-labels
                        }

                        if (multisigTransactions == null) {
                            multisigTransactions = {}
                            this.state.accountMultisigTransactions[address] = multisigTransactions
                        }

                        multisigTransactionsChanged = true

                        const multisigTransaction = multisigTransactions[transactionId] as
                            | AggregatedMultisigTransactionInfo
                            | undefined
                        if (multisigTransaction == null) {
                            multisigTransactions[transactionId] = {
                                confirmations: [method.data.custodian],
                                createdAt: transaction.createdAt,
                            }
                        }
                        else {
                            multisigTransaction.createdAt = transaction.createdAt
                            multisigTransaction.confirmations.push(method.data.custodian)
                        }

                        break
                    }
                    case 'confirm': {
                        const { transactionId } = method.data

                        if (multisigTransactions == null) {
                            multisigTransactions = {}
                            this.state.accountMultisigTransactions[address] = multisigTransactions
                        }

                        multisigTransactionsChanged = true

                        const finalTransactionHash = transaction.outMessages.length > 0
                            ? transaction.id.hash : undefined

                        const multisigTransaction = multisigTransactions[transactionId] as
                            | AggregatedMultisigTransactionInfo
                            | undefined
                        if (multisigTransaction == null) {
                            multisigTransactions[transactionId] = {
                                finalTransactionHash,
                                confirmations: [method.data.custodian],
                                createdAt: extractMultisigTransactionTime(transactionId),
                            }
                        }
                        else {
                            if (finalTransactionHash != null) {
                                multisigTransaction.finalTransactionHash = finalTransactionHash
                            }
                            multisigTransaction.confirmations.push(method.data.custodian)
                        }

                        break
                    }
                    default:
                        break
                }
            }
        }

        if (multisigTransactionsChanged) {
            update.accountMultisigTransactions = this.state.accountMultisigTransactions
        }

        this.update(update)
    }

    private _updateUnconfirmedTransactions(
        address: string,
        unconfirmedTransactions: nt.MultisigPendingTransaction[],
    ) {
        let { accountUnconfirmedTransactions } = this.state

        const entries: { [transitionId: string]: nt.MultisigPendingTransaction } = {}

        unconfirmedTransactions.forEach(transaction => {
            entries[transaction.id] = transaction
        })

        accountUnconfirmedTransactions = {
            ...accountUnconfirmedTransactions,
            [address]: entries,
        }

        this.update({
            accountUnconfirmedTransactions,
        })
    }

    private _updateCustodians(address: string, custodians: string[]) {
        const { accountCustodians } = this.state
        accountCustodians[address] = custodians
        this.update({
            accountCustodians,
        })
    }

    private _updateAccountDetails(address: string, details: nt.TonWalletDetails) {
        this.update({
            accountDetails: {
                ...this.state.accountDetails,
                [address]: details,
            },
        })
    }

    private _updateTokenTransactions(
        owner: string,
        rootTokenContract: string,
        transactions: nt.TokenWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ) {
        const messagesHashes = transactions.map(transaction => transaction.inMessage.hash)

        this._removePendingTransactions(owner, messagesHashes)
        this._updateLastTokenTransaction(owner, rootTokenContract, transactions[0].id)

        const currentTransactions = this.state.accountTokenTransactions

        const ownerTransactions = currentTransactions[owner] || []
        const newOwnerTransactions = {
            ...ownerTransactions,
            [rootTokenContract]: mergeTransactions(
                ownerTransactions[rootTokenContract] || [],
                transactions,
                info,
            ),
        }

        const accountTokenTransactions = {
            ...currentTransactions,
            [owner]: newOwnerTransactions,
        }

        this.update({ accountTokenTransactions })
    }

    private _updateJettonTransactions(
        owner: string,
        rootTokenContract: string,
        transactions: nt.JettonWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ) {
        const messagesHashes = transactions.map(transaction => transaction.inMessage.hash)

        this._removePendingTransactions(owner, messagesHashes)
        this._updateLastTokenTransaction(owner, rootTokenContract, transactions[0].id)

        const currentTransactions = this.state.accountTokenTransactions

        const ownerTransactions = currentTransactions[owner] || []
        const newOwnerTransactions = {
            ...ownerTransactions,
            [rootTokenContract]: mergeTransactions(
                ownerTransactions[rootTokenContract] || [],
                transactions,
                info,
            ),
        }

        const accountTokenTransactions = {
            ...currentTransactions,
            [owner]: newOwnerTransactions,
        }

        this.update({ accountTokenTransactions })
    }

    private _updateKnownTokens(rootTokenContract: string, symbol: nt.Symbol | JettonSymbol): Promise<void> {
        this.update({
            knownTokens: {
                ...this.state.knownTokens,
                [rootTokenContract]: symbol,
            },
        })

        return this.config.storage.set({ knownTokens: this.state.knownTokens })
    }

    private _saveSelectedAccountAddress(): Promise<void> {
        return this.config.storage.set({ selectedAccountAddress: this.state.selectedAccountAddress })
    }

    private _saveSelectedMasterKey(): Promise<void> {
        return this.config.storage.set({ selectedMasterKey: this.state.selectedMasterKey })
    }

    private _saveMasterKeysNames(): Promise<void> {
        return this.config.storage.set({ masterKeysNames: this.state.masterKeysNames })
    }

    private _saveRecentMasterKeys(): Promise<void> {
        return this.config.storage.set({ recentMasterKeys: this.state.recentMasterKeys })
    }

    private _saveAccountsVisibility(): Promise<void> {
        return this.config.storage.set({ accountsVisibility: this.state.accountsVisibility })
    }

    private _saveExternalAccounts(): Promise<void> {
        return this.config.storage.set({ externalAccounts: this.state.externalAccounts })
    }

    private _updateLastTransaction(address: string, id: nt.TransactionId) {
        const prevLt = this._lastTransactions[address]?.lt ?? '0'

        if (BigInt(prevLt) >= BigInt(id.lt)) return

        this._lastTransactions = {
            ...this._lastTransactions,
            [address]: id,
        }

        this.config.storage.set({
            lastTransactions: this._lastTransactions,
        }).catch(log.error)
    }

    private _updateLastTokenTransaction(owner: string, rootTokenContract: string, id: nt.TransactionId) {
        const prevLt = this._lastTokenTransactions[owner]?.[rootTokenContract]?.lt ?? '0'

        if (BigInt(prevLt) >= BigInt(id.lt)) return

        this._lastTokenTransactions = {
            ...this._lastTokenTransactions,
            [owner]: {
                ...this._lastTokenTransactions[owner],
                [rootTokenContract]: id,
            },
        }

        this.config.storage.set({
            lastTokenTransactions: this._lastTokenTransactions,
        }).catch(log.error)

    }

    private _splitEverTransactionsBatch(
        address: string,
        transactions: nt.TonWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ): Array<{ transactions: nt.TonWalletTransaction[], info: nt.TransactionsBatchInfo }> {
        const latestLt = BigInt(this._lastTransactions[address]?.lt ?? '0')
        return this._splitTransactionsBatch(transactions, info, latestLt)
    }

    private _splitTokenTransactionsBatch(
        owner: string,
        rootTokenContract: string,
        transactions: nt.TokenWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ): Array<{ transactions: nt.TokenWalletTransaction[], info: nt.TransactionsBatchInfo }> {
        const latestLt = BigInt(this._lastTokenTransactions[owner]?.[rootTokenContract]?.lt ?? '0')
        return this._splitTransactionsBatch(transactions, info, latestLt)
    }

    private _splitJettonTransactionsBatch(
        owner: string,
        rootTokenContract: string,
        transactions: nt.JettonWalletTransaction[],
        info: nt.TransactionsBatchInfo,
    ): Array<{ transactions: nt.JettonWalletTransaction[], info: nt.TransactionsBatchInfo }> {
        const latestLt = BigInt(this._lastTokenTransactions[owner]?.[rootTokenContract]?.lt ?? '0')
        return this._splitTransactionsBatch(transactions, info, latestLt)
    }

    /**
     * Extract "new" transactions from "old" batch due to service worker inactivity
     */
    private _splitTransactionsBatch<T extends nt.Transaction>(
        transactions: T[],
        info: nt.TransactionsBatchInfo,
        latestLt: bigint,
    ): Array<{ transactions: T[], info: nt.TransactionsBatchInfo }> {
        if (info.batchType === 'new') return [{ transactions, info }]
        if (BigInt(info.maxLt) <= latestLt || latestLt === BigInt(0)) return [{ transactions, info }]

        const index = transactions.findIndex(({ id }) => BigInt(id.lt) <= latestLt)
        const newTx = index === -1 ? transactions : transactions.slice(0, index)
        const oldTx = index === -1 ? [] : transactions.slice(index)
        const result = [] as Array<{ transactions: T[], info: nt.TransactionsBatchInfo }>

        if (oldTx.length) {
            result.push({
                transactions: oldTx,
                info: {
                    batchType: 'old',
                    minLt: oldTx[oldTx.length - 1].id.lt,
                    maxLt: oldTx[0].id.lt,
                },
            })
        }

        if (newTx.length) {
            result.push({
                transactions: newTx,
                info: {
                    batchType: 'new',
                    minLt: newTx[newTx.length - 1].id.lt,
                    maxLt: newTx[0].id.lt,
                },
            })
        }

        return result
    }

    private async _clearPendingTransactions(): Promise<void> {
        await browser.storage.local.remove('accountPendingTransactions')
    }

    private async _loadPendingTransactions(): Promise<AccountControllerState['accountPendingTransactions'] | undefined> {
        const {
            accountPendingTransactions,
        } = await browser.storage.local.get('accountPendingTransactions')

        return accountPendingTransactions
    }

    private async _savePendingTransactions(): Promise<void> {
        await this.config.storage.set({ accountPendingTransactions: this.state.accountPendingTransactions })
    }

    private _schedulePendingTransactionsExpiration(
        accountPendingTransactions: AccountControllerState['accountPendingTransactions'],
    ) {
        const now = Date.now()

        for (const [address, pendingTransactions] of Object.entries(accountPendingTransactions)) {
            const hashes: string[] = []
            let latestExpireAt = 0

            for (const [hash, info] of Object.entries(pendingTransactions)) {
                const expireAt = info.expireAt * 1000

                if (expireAt <= now) {
                    // remove already expired pending transactions
                    delete pendingTransactions[hash]
                }
                else {
                    latestExpireAt = Math.max(latestExpireAt, expireAt)
                    hashes.push(hash)
                }
            }

            if (latestExpireAt) {
                // workaround for expired pending transactions
                setTimeout(() => {
                    this._removePendingTransactions(address, hashes)
                }, (latestExpireAt - now) + 5000)
            }
        }
    }

    private _getAccountsByMasterKey(masterKey: string): nt.AssetsList[] {
        const { accountEntries, externalAccounts, storedKeys } = this.state

        const addresses = new Set<string>()
        const accounts: nt.AssetsList[] = []
        const selectedPublicKeys = new Set(
            Object.values(storedKeys)
                .filter((key) => key.masterKey === masterKey)
                .map((key) => key.publicKey),
        )

        for (const account of Object.values(accountEntries)) {
            if (selectedPublicKeys.has(account.tonWallet.publicKey)) {
                addresses.add(account.tonWallet.address)
                accounts.push(account)
            }
        }

        for (const { address, externalIn } of externalAccounts) {
            const isSelected = externalIn.some((key) => selectedPublicKeys.has(key))
            if (isSelected && accountEntries[address] && !addresses.has(address)) {
                addresses.add(address)
                accounts.push(accountEntries[address])
            }
        }

        return accounts
    }

    private async _getOrCreateEverWalletSubscription(
        address: string,
    ): Promise<EverWalletSubscription | undefined> {
        let subscription = this._everWalletSubscriptions.get(address)

        if (!subscription) {
            subscription = await this._accountsMutex.use(async () => {
                const { accountEntries } = this.state
                const account = accountEntries[address]
                let subscription = this._everWalletSubscriptions.get(address)

                if (!subscription && account) {
                    subscription = await this._createEverWalletSubscription(
                        account.tonWallet.address,
                        account.tonWallet.publicKey,
                        account.tonWallet.contractType,
                    )
                }

                return subscription
            })
        }

        return subscription
    }

    private async _getOrCreateTokenWalletSubscription(
        owner: string,
        rootTokenContract: string,
    ): Promise<TokenWalletSubscription | undefined> {
        let subscription = this._tokenWalletSubscriptions.get(owner)?.get(rootTokenContract)

        if (!subscription) {
            subscription = await this._accountsMutex.use(async () => {
                const { accountEntries } = this.state
                const account = accountEntries[owner]
                let subscription = this._tokenWalletSubscriptions.get(owner)?.get(rootTokenContract)

                if (!subscription && account) {
                    subscription = await this._createTokenWalletSubscription(
                        account.tonWallet.address,
                        rootTokenContract,
                    )
                }

                return subscription
            })
        }

        return subscription
    }

    private async _getOrCreateJettonWalletSubscription(
        owner: string,
        rootTokenContract: string,
    ): Promise<JettonWalletSubscription | undefined> {
        let subscription = this._jettonWalletSubscriptions.get(owner)?.get(rootTokenContract)

        if (!subscription) {
            subscription = await this._accountsMutex.use(async () => {
                const { accountEntries } = this.state
                const account = accountEntries[owner]
                let subscription = this._jettonWalletSubscriptions.get(owner)?.get(rootTokenContract)

                if (!subscription && account) {
                    subscription = await this._createJettonWalletSubscription(
                        account.tonWallet.address,
                        rootTokenContract,
                    )
                }

                return subscription
            })
        }

        return subscription
    }

    private _enableIntensivePolling() {
        const { selectedMasterKey } = this.state

        if (!selectedMasterKey) return

        const selectedAccounts = this._getAccountsByMasterKey(selectedMasterKey)

        for (const account of selectedAccounts) {
            const everSubscription = this._everWalletSubscriptions.get(account.tonWallet.address)
            const tokenSubscriptions = this._tokenWalletSubscriptions.get(account.tonWallet.address)
            const jettonSubscriptions = this._jettonWalletSubscriptions.get(account.tonWallet.address)

            everSubscription?.skipRefreshTimer()
            everSubscription?.setPollingInterval(DEFAULT_POLLING_INTERVAL)

            tokenSubscriptions?.forEach((subscription) => {
                subscription.skipRefreshTimer()
                subscription.setPollingInterval(DEFAULT_POLLING_INTERVAL)
            })

            jettonSubscriptions?.forEach((subscription) => {
                subscription.skipRefreshTimer()
                subscription.setPollingInterval(DEFAULT_POLLING_INTERVAL)
            })
        }
    }

    private _disableIntensivePolling() {
        this._everWalletSubscriptions.forEach(subscription => {
            subscription.setPollingInterval(BACKGROUND_POLLING_INTERVAL)
        })
        this._tokenWalletSubscriptions.forEach(subscriptions => {
            subscriptions.forEach(subscription => {
                subscription.setPollingInterval(BACKGROUND_POLLING_INTERVAL)
            })
        })
        this._jettonWalletSubscriptions.forEach(subscriptions => {
            subscriptions.forEach(subscription => {
                subscription.setPollingInterval(BACKGROUND_POLLING_INTERVAL)
            })
        })
    }

    private async _getStoredKeys(): Promise<Record<string, nt.KeyStoreEntry>> {
        const keyStoreEntries = await this.config.keyStore.getKeys()
        const storedKeys: Record<string, nt.KeyStoreEntry> = {}

        for (const entry of keyStoreEntries) {
            storedKeys[entry.publicKey] = entry
        }

        return storedKeys
    }

    private async _computeSignatureId(withSignatureId: boolean | number): Promise<number | undefined> {
        if (withSignatureId === false) {
            return undefined
        }
        if (typeof withSignatureId === 'number') {
            return withSignatureId
        }

        return this.config.connectionController.getCurrentNetworkDescription().signatureId
    }

}

function requireEverWalletSubscription(
    address: string,
    subscription?: EverWalletSubscription,
): asserts subscription is EverWalletSubscription {
    if (!subscription) {
        throw new NekotonRpcError(
            RpcErrorCode.RESOURCE_UNAVAILABLE,
            `There is no subscription for address ${address}`,
        )
    }
}

function requireTokenWalletSubscription(
    address: string,
    rootTokenContract: string,
    subscription?: TokenWalletSubscription,
): asserts subscription is TokenWalletSubscription {
    if (!subscription) {
        throw new NekotonRpcError(
            RpcErrorCode.RESOURCE_UNAVAILABLE,
            `There is no token subscription for owner ${address}, root token contract ${rootTokenContract}`,
        )
    }
}

function requireJettonWalletSubscription(
    address: string,
    rootTokenContract: string,
    subscription?: JettonWalletSubscription,
): asserts subscription is JettonWalletSubscription {
    if (!subscription) {
        throw new NekotonRpcError(
            RpcErrorCode.RESOURCE_UNAVAILABLE,
            `There is no jetton subscription for owner ${address}, root jetton contract ${rootTokenContract}`,
        )
    }
}

type InnerError = nt.TransactionTreeSimulationError['error']
type ErrorWithCode = { type: 'action_phase' | 'compute_phase' }

function hasErrorCode(
    error: InnerError,
): error is Extract<InnerError, ErrorWithCode> {
    return error.type === 'action_phase' || error.type === 'compute_phase'
}

type HiddenAsset = {
    [group: string]: string[] | undefined
}

type HiddenAssets = {
    [account: string]: HiddenAsset | undefined
}

interface AccountStorage {
    accountsVisibility: AccountControllerState['accountsVisibility'];
    externalAccounts: AccountControllerState['externalAccounts'];
    masterKeysNames: AccountControllerState['masterKeysNames'];
    recentMasterKeys: AccountControllerState['recentMasterKeys'];
    knownTokens: AccountControllerState['knownTokens'];
    accountPendingTransactions: AccountControllerState['accountPendingTransactions'];
    selectedAccountAddress: string;
    selectedMasterKey: string;
    lastTransactions: Record<string, nt.TransactionId>;
    lastTokenTransactions: Record<string, Record<string, nt.TransactionId>>;
    hiddenAdditionalAssets: HiddenAssets;
}

Storage.register<AccountStorage>({
    accountsVisibility: {
        exportable: true,
        deserialize: Deserializers.object,
        validate: (value: unknown) => !value || typeof value === 'object',
    },
    externalAccounts: {
        exportable: true,
        deserialize: Deserializers.array,
        validate: (value: unknown) => !value || Array.isArray(value),
    },
    masterKeysNames: {
        exportable: true,
        deserialize: Deserializers.object,
        validate: (value: unknown) => !value || typeof value === 'object',
    },
    recentMasterKeys: {
        exportable: true,
        deserialize: Deserializers.array,
        validate: (value: unknown) => !value || Array.isArray(value),
    },
    knownTokens: {
        exportable: true,
        deserialize: Deserializers.object,
        validate: (value: unknown) => !value || typeof value === 'object',
    },
    accountPendingTransactions: { deserialize: Deserializers.object },
    selectedAccountAddress: { deserialize: Deserializers.string },
    selectedMasterKey: { deserialize: Deserializers.string },
    lastTransactions: { deserialize: Deserializers.object },
    lastTokenTransactions: { deserialize: Deserializers.object },

    hiddenAdditionalAssets: {
        exportable: true,
        deserialize: Deserializers.object,
        validate: (value: unknown) => !value || typeof value === 'object',
    },
})
