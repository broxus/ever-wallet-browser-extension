import type * as nt from '@broxus/ever-wallet-wasm'
import { EventEmitter } from 'events'
import type { ProviderEvent, RawProviderEventData } from 'everscale-inpage-provider'
import debounce from 'lodash.debounce'
import { nanoid } from 'nanoid'
import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import { Duplex } from 'readable-stream'
import browser from 'webextension-polyfill'
import log from 'loglevel'

import { createEngineStream, createMetaRPCHandler, focusTab, focusWindow, JsonRpcEngine, JsonRpcMiddleware, NEKOTON_CONTROLLER, NEKOTON_PROVIDER, nodeifyAsync, openExtensionInBrowser, PHISHING, PHISHING_SAFELIST } from '@app/shared'
import type { ConnectionDataItem, ExternalWindowParams, Nekoton, PendingApprovalInfo, RpcEvent, TriggerUiParams, WalletMessageToSend, WindowInfo } from '@app/models'
import { createHelperMiddleware } from '@app/background/middleware/helperMiddleware'

import { LedgerBridge, LedgerConnector, LedgerRpcClient } from '../ledger'
import { StorageConnector } from '../utils/StorageConnector'
import { WindowManager } from '../utils/WindowManager'
import { ContractFactory } from '../utils/Contract'
import { MemoryFetchCache } from '../utils/FetchCache'
import { AccountController } from './AccountController/AccountController'
import { ConnectionController } from './ConnectionController'
import { LocalizationController } from './LocalizationController'
import { NotificationController } from './NotificationController'
import { PermissionsController } from './PermissionsController'
import { StakeController } from './StakeController'
import { PhishingController } from './PhishingController'
import { NftController } from './NftController'
import { ContactsController } from './ContactsController'
import { Storage } from '../utils/Storage'
import { StorageMigrationFactory } from '../utils/StorageMigrationFactory'

export interface NekotonControllerOptions {
    nekoton: Nekoton;
    windowManager: WindowManager;
    openExternalWindow: (params: TriggerUiParams) => void;
    getOpenNekotonTabIds: () => { [id: number]: true };
}

interface NekotonControllerComponents {
    nekoton: Nekoton,
    counters: Counters;
    ntstorage: nt.Storage;
    accountsStorage: nt.AccountsStorage;
    keyStore: nt.KeyStore;
    clock: nt.ClockWithOffset;
    windowManager: WindowManager;
    accountController: AccountController;
    connectionController: ConnectionController;
    localizationController: LocalizationController;
    notificationController: NotificationController;
    permissionsController: PermissionsController;
    stakeController: StakeController;
    phishingController: PhishingController;
    contactsController: ContactsController;
    nftController: NftController;
    ledgerRpcClient: LedgerRpcClient;
    storage: Storage;
}

interface SetupProviderEngineOptions {
    origin: string;
    location?: string;
    extensionId?: string;
    tabId?: number;
    isInternal: boolean;
    frameId?: number;
}

class Counters {

    activeControllerConnections: number = 0

    reservedControllerConnections: number = 0

}

type ApiCallback<T> = (error: Error | null, result?: T) => void;

export class NekotonController extends EventEmitter {

    private readonly _connections: { [id: string]: { engine: JsonRpcEngine } } = {}

    private readonly _originToConnectionIds: { [origin: string]: Set<string> } = {}

    private readonly _originToTabIds: { [origin: string]: Set<number> } = {}

    private readonly _tabToConnectionIds: { [tabId: number]: Set<string> } = {}

    private readonly _options: NekotonControllerOptions

    private readonly _components: NekotonControllerComponents

    public static async load(options: NekotonControllerOptions): Promise<NekotonController> {
        const nekoton = options.nekoton
        const counters = new Counters()
        const ntstorage = new nekoton.Storage(new StorageConnector())
        const accountsStorage = await nekoton.AccountsStorage.load(ntstorage)

        const ledgerRpcClient = new LedgerRpcClient()
        const ledgerBridge = new LedgerBridge(ledgerRpcClient)
        const ledgerConnection = new nekoton.LedgerConnection(new LedgerConnector(ledgerBridge))

        const keyStore = await nekoton.KeyStore.load(ntstorage, ledgerConnection)
        setInterval(() => {
            keyStore.refreshPasswordCache()
        }, 10000)

        const clock = new nekoton.ClockWithOffset()

        const storage = new Storage()
        Storage.register({
            [nekoton.accountsStorageKey()]: {
                exportable: true,
                validate: (value: unknown) => typeof value === 'string' && nekoton.AccountsStorage.verify(value),
            },
            [nekoton.keystoreStorageKey()]: {
                exportable: true,
                validate: (value: unknown) => typeof value === 'string' && nekoton.KeyStore.verify(value),
            },
        })
        storage.addMigration(
            StorageMigrationFactory.removeStakeBannerState(),
            StorageMigrationFactory.fixInvalidStoredAccounts(accountsStorage, keyStore),
            StorageMigrationFactory.updateContactsFormat(),
        )

        const connectionController = new ConnectionController({
            nekoton,
            clock,
            storage,
            cache: new MemoryFetchCache(),
        })

        const notificationController = new NotificationController({
            disabled: false,
        })

        const localizationController = new LocalizationController({
            storage,
        })

        const contractFactory = new ContractFactory(nekoton, clock, connectionController)
        // const gasPriceService = new GasPriceService(nekoton, contractFactory)
        const accountController = new AccountController({
            nekoton,
            clock,
            accountsStorage,
            keyStore,
            connectionController,
            localizationController,
            ledgerBridge,
            contractFactory,
            storage,
        })

        const permissionsController = new PermissionsController({
            storage,
        })

        const stakeController = new StakeController({
            nekoton,
            clock,
            connectionController,
            accountController,
            contractFactory,
        })

        const phishingController = new PhishingController({
            refreshInterval: 60 * 60 * 1000, // 1 hour
            storage,
        })

        const nftController = new NftController({
            nekoton,
            connectionController,
            accountController,
            contractFactory,
            storage,
        })

        const contactsController = new ContactsController({
            nekoton,
            connectionController,
            contractFactory,
            storage,
        })

        await storage.load()

        localizationController.initialSync()
        permissionsController.initialSync()
        stakeController.initialSync()
        phishingController.initialSync()
        nftController.initialSync()
        contactsController.initialSync()
        await connectionController.initialSync()
        await accountController.initialSync()

        if (connectionController.initialized) {
            await Promise.all([
                accountController.startSubscriptions(),
                stakeController.startSubscriptions(),
            ])
        }

        return new NekotonController(options, {
            windowManager: options.windowManager,
            nekoton,
            counters,
            ntstorage,
            accountsStorage,
            keyStore,
            clock,
            accountController,
            connectionController,
            localizationController,
            notificationController,
            permissionsController,
            stakeController,
            phishingController,
            nftController,
            ledgerRpcClient,
            contactsController,
            storage,
        })
    }

    private constructor(
        options: NekotonControllerOptions,
        components: NekotonControllerComponents,
    ) {
        super()
        this._options = options
        this._components = components

        this._components.localizationController.subscribe(_state => {
            this._debouncedSendUpdate()
        })

        this._components.accountController.subscribe(_state => {
            this._debouncedSendUpdate()
        })

        this._components.connectionController.subscribe(_state => {
            this._debouncedSendUpdate()
        })

        this._components.stakeController.subscribe(_state => {
            this._debouncedSendUpdate()
        })

        this._components.nftController.subscribe(_state => {
            this._debouncedSendUpdate()
        })

        this._components.contactsController.subscribe(_state => {
            this._debouncedSendUpdate()
        })

        this._components.permissionsController.config.notifyDomain = this._notifyConnections.bind(this)
        this._components.nftController.config.sendEvent = this._sendEvent.bind(this)

        this.on('controllerConnectionChanged', (activeControllerConnections: number) => {
            if (activeControllerConnections > 0) {
                this._components.accountController.enableIntensivePolling()
                this._components.stakeController.enableIntensivePolling()
                this._components.notificationController.setHidden(true)
            }
            else {
                this._components.accountController.disableIntensivePolling()
                this._components.stakeController.disableIntensivePolling()
                this._components.notificationController.setHidden(false)
            }
        })
    }

    public setupTrustedCommunication(mux: ObjectMultiplex): void {
        this._setupControllerConnection(mux.createStream(NEKOTON_CONTROLLER))
        this._components.ledgerRpcClient.addStream(mux.createStream('ledger'))
    }

    public async setupUntrustedCommunication(
        mux: ObjectMultiplex,
        sender: browser.Runtime.MessageSender,
    ): Promise<void> {
        if (sender.url) {
            const { phishingController } = this._components

            const phishingListsAreOutOfDate = phishingController.isOutOfDate()
            if (phishingListsAreOutOfDate) {
                await phishingController.updatePhishingLists()
            }

            const { hostname } = new URL(sender.url)
            // Check if new connection is blocked if phishing detection is on
            const phishingTestResponse = phishingController.test(hostname)
            if (phishingTestResponse?.result) {
                this._sendPhishingWarning(mux, hostname)
                return
            }
        }

        this._setupProviderConnection(mux.createStream(NEKOTON_PROVIDER), sender, false)
    }

    public setupPhishingCommunication(mux: ObjectMultiplex): void {
        const phishingStream = mux.createStream(PHISHING_SAFELIST)
        const { phishingController } = this._components

        phishingStream.on(
            'data',
            createMetaRPCHandler(
                {
                    safelistPhishingDomain: nodeifyAsync(phishingController, 'bypass'),
                },
                phishingStream,
            ),
        )
    }

    public getApi() {
        const {
            windowManager,
            accountController,
            connectionController,
            localizationController,
            stakeController,
            nftController,
            contactsController,
        } = this._components

        return {
            initialize: async (windowId: number | undefined, cb: ApiCallback<WindowInfo>) => {
                const group = windowId != null ? windowManager.getGroup(windowId) : undefined
                let approvalInfo: PendingApprovalInfo | undefined

                if (group === 'approval') {
                    approvalInfo = await this.tempStorageRemove<PendingApprovalInfo>('pendingApprovalInfo')
                }

                cb(null, {
                    group,
                    approvalTabId: approvalInfo?.tabId,
                    approvalFrameId: approvalInfo?.frameId,
                })
            },
            getState: (cb: ApiCallback<ReturnType<typeof NekotonController.prototype.getState>>) => {
                cb(null, this.getState())
            },
            openExtensionInBrowser: (
                params: { route?: string; query?: string, force?: boolean },
                cb: ApiCallback<browser.Tabs.Tab>,
            ) => {
                const existingTabs = Object.keys(this._options.getOpenNekotonTabIds())
                // TODO: refactor
                if (existingTabs.length === 0 || params.force) {
                    openExtensionInBrowser(params.route, params.query).then(async (tab) => {
                        if (tab && typeof tab.windowId !== 'undefined') {
                            await focusWindow(tab.windowId)
                        }

                        cb(null, tab)
                    })
                }
                else {
                    focusTab(existingTabs[0]).then(async tab => {
                        if (tab && tab.windowId != null) {
                            await focusWindow(tab.windowId)
                        }
                        cb(null, tab)
                    })
                }
            },
            openExtensionInExternalWindow: (
                { group, width, height }: ExternalWindowParams,
                cb: ApiCallback<undefined>,
            ) => {
                this._options.openExternalWindow({
                    group,
                    width,
                    height,
                    force: true,
                })
                cb(null)
            },
            sendEvent: (params: RpcEvent, cb: ApiCallback<undefined>) => {
                this._sendEvent(params)
                cb(null)
            },
            tempStorageInsert: nodeifyAsync(this, 'tempStorageInsert'),
            tempStorageRemove: nodeifyAsync(this, 'tempStorageRemove'),
            changeNetwork: nodeifyAsync(this, 'changeNetwork'),
            importStorage: nodeifyAsync(this, 'importStorage'),
            exportStorage: nodeifyAsync(this, 'exportStorage'),
            checkPassword: nodeifyAsync(accountController, 'checkPassword'),
            isPasswordCached: nodeifyAsync(accountController, 'isPasswordCached'),
            createMasterKey: nodeifyAsync(accountController, 'createMasterKey'),
            selectMasterKey: nodeifyAsync(accountController, 'selectMasterKey'),
            exportSeed: nodeifyAsync(accountController, 'exportSeed'),
            updateMasterKeyName: nodeifyAsync(accountController, 'updateMasterKeyName'),
            updateRecentMasterKey: nodeifyAsync(accountController, 'updateRecentMasterKey'),
            getPublicKeys: nodeifyAsync(accountController, 'getPublicKeys'),
            createDerivedKey: nodeifyAsync(accountController, 'createDerivedKey'),
            createDerivedKeys: nodeifyAsync(accountController, 'createDerivedKeys'),
            createLedgerKey: nodeifyAsync(accountController, 'createLedgerKey'),
            removeMasterKey: nodeifyAsync(accountController, 'removeMasterKey'),
            removeKey: nodeifyAsync(accountController, 'removeKey'),
            removeKeys: nodeifyAsync(accountController, 'removeKeys'),
            getLedgerMasterKey: nodeifyAsync(accountController, 'getLedgerMasterKey'),
            getLedgerFirstPage: nodeifyAsync(accountController, 'getLedgerFirstPage'),
            getLedgerNextPage: nodeifyAsync(accountController, 'getLedgerNextPage'),
            getLedgerPreviousPage: nodeifyAsync(accountController, 'getLedgerPreviousPage'),
            getLedgerAddress: nodeifyAsync(accountController, 'getLedgerAddress'),
            setLocale: nodeifyAsync(localizationController, 'setLocale'),
            createAccount: nodeifyAsync(accountController, 'createAccount'),
            createAccounts: nodeifyAsync(accountController, 'createAccounts'),
            ensureAccountSelected: nodeifyAsync(accountController, 'ensureAccountSelected'),
            selectFirstAccount: nodeifyAsync(accountController, 'selectFirstAccount'),
            addExternalAccount: nodeifyAsync(accountController, 'addExternalAccount'),
            selectAccount: nodeifyAsync(accountController, 'selectAccount'),
            removeAccount: nodeifyAsync(accountController, 'removeAccount'),
            removeAccounts: nodeifyAsync(accountController, 'removeAccounts'),
            renameAccount: nodeifyAsync(accountController, 'renameAccount'),
            updateAccountVisibility: nodeifyAsync(accountController, 'updateAccountVisibility'),
            updateDerivedKeyName: nodeifyAsync(accountController, 'updateDerivedKeyName'),
            getMultisigPendingTransactions: nodeifyAsync(
                accountController,
                'getMultisigPendingTransactions',
            ),
            findExistingWallets: nodeifyAsync(accountController, 'findExistingWallets'),
            getEverWalletInitData: nodeifyAsync(accountController, 'getEverWalletInitData'),
            getTokenRootDetailsFromTokenWallet: nodeifyAsync(
                accountController,
                'getTokenRootDetailsFromTokenWallet',
            ),
            getTokenWalletBalance: nodeifyAsync(accountController, 'getTokenWalletBalance'),
            updateTokenWallets: nodeifyAsync(accountController, 'updateTokenWallets'),
            logOut: nodeifyAsync(this, 'logOut'),
            estimateFees: nodeifyAsync(accountController, 'estimateFees'),
            estimateConfirmationFees: nodeifyAsync(accountController, 'estimateConfirmationFees'),
            estimateDeploymentFees: nodeifyAsync(accountController, 'estimateDeploymentFees'),
            simulateTransactionTree: nodeifyAsync(accountController, 'simulateTransactionTree'),
            simulateConfirmationTransactionTree: nodeifyAsync(accountController, 'simulateConfirmationTransactionTree'),
            prepareTransferMessage: nodeifyAsync(accountController, 'prepareTransferMessage'),
            prepareConfirmMessage: nodeifyAsync(accountController, 'prepareConfirmMessage'),
            prepareDeploymentMessage: nodeifyAsync(accountController, 'prepareDeploymentMessage'),
            prepareTokenMessage: nodeifyAsync(accountController, 'prepareTokenMessage'),
            prepareJettonMessage: nodeifyAsync(accountController, 'prepareJettonMessage'),
            sendMessage: (address: string, args: WalletMessageToSend, cb: ApiCallback<void>) => {
                accountController
                    .sendMessage(address, args)
                    .then(() => cb(null))
                    .catch((e) => cb(e))
            },
            preloadTransactions: nodeifyAsync(accountController, 'preloadTransactions'),
            preloadTokenTransactions: nodeifyAsync(accountController, 'preloadTokenTransactions'),
            updateContractState: nodeifyAsync(accountController, 'updateContractState'),
            getTokenBalance: nodeifyAsync(accountController, 'getTokenBalance'),
            changeKeyPassword: nodeifyAsync(accountController, 'changeKeyPassword'),
            exportKeyPair: nodeifyAsync(accountController, 'exportKeyPair'),
            getStakeDetails: nodeifyAsync(stakeController, 'getStakeDetails'),
            getDepositStEverAmount: nodeifyAsync(stakeController, 'getDepositStEverAmount'),
            getWithdrawEverAmount: nodeifyAsync(stakeController, 'getWithdrawEverAmount'),
            encodeDepositPayload: nodeifyAsync(stakeController, 'encodeDepositPayload'),
            scanNftCollections: nodeifyAsync(nftController, 'scanNftCollections'),
            getNftCollections: nodeifyAsync(nftController, 'getNftCollections'),
            getNftsByCollection: nodeifyAsync(nftController, 'getNftsByCollection'),
            getNfts: nodeifyAsync(nftController, 'getNft'),
            prepareNftTransfer: nodeifyAsync(nftController, 'prepareNftTransfer'),
            prepareNftTokenTransfer: nodeifyAsync(nftController, 'prepareNftTokenTransfer'),
            updateAccountNftCollections: nodeifyAsync(nftController, 'updateAccountNftCollections'),
            updateNftCollectionVisibility: nodeifyAsync(nftController, 'updateNftCollectionVisibility'),
            searchNftCollectionByAddress: nodeifyAsync(nftController, 'searchNftCollectionByAddress'),
            removeAccountPendingNfts: nodeifyAsync(nftController, 'removeAccountPendingNfts'),
            updateCustomNetwork: nodeifyAsync(connectionController, 'updateCustomNetwork'),
            deleteCustomNetwork: nodeifyAsync(connectionController, 'deleteCustomNetwork'),
            resetCustomNetworks: nodeifyAsync(connectionController, 'resetCustomNetworks'),
            getAvailableNetworks: (cb: ApiCallback<ConnectionDataItem[]>) => {
                cb(null, connectionController.getAvailableNetworks())
            },
            resolveDensPath: nodeifyAsync(contactsController, 'resolveDensPath'),
            refreshDensContacts: nodeifyAsync(contactsController, 'refreshDensContacts'),
            addRecentContacts: nodeifyAsync(contactsController, 'addRecentContacts'),
            removeRecentContact: nodeifyAsync(contactsController, 'removeRecentContact'),
            addContact: nodeifyAsync(contactsController, 'addContact'),
            removeContact: nodeifyAsync(contactsController, 'removeContact'),
        }
    }

    public getState() {
        return {
            ...this._components.accountController.state,
            ...this._components.connectionController.state,
            ...this._components.localizationController.state,
            ...this._components.stakeController.state,
            ...this._components.nftController.state,
            ...this._components.contactsController.state,
        }
    }

    public async tempStorageInsert<T = any>(key: string, value: T): Promise<T | undefined> {
        const { [key]: oldValue } = await chrome.storage.session.get(key)
        await chrome.storage.session.set({ [key]: value })
        return oldValue
    }

    public async tempStorageRemove<T = any>(key: string): Promise<T | undefined> {
        const { [key]: value } = await chrome.storage.session.get(key)
        await chrome.storage.session.remove(key)
        return value
    }

    public async changeNetwork(connectionDataItem?: ConnectionDataItem): Promise<boolean> {
        const { accountController, stakeController, connectionController } = this._components
        const { selectedConnection } = connectionController.state
        const currentNetwork = connectionController.getAvailableNetworks().find(
            (item) => item.connectionId === selectedConnection.connectionId,
        ) ?? selectedConnection
        const params = connectionDataItem ?? currentNetwork

        await Promise.all([
            accountController.stopSubscriptions(),
            stakeController.stopSubscriptions(),
        ])
        log.trace('Stopped account subscriptions')

        try {
            await connectionController.trySwitchingNetwork(params, true)
            return true
        }
        catch (e: any) {
            try {
                await connectionController.trySwitchingNetwork(currentNetwork, true)
            }
            catch {
                connectionController.markSelectedConnectionAsFailed()
            }
        }
        finally {
            await Promise.all([
                accountController.startSubscriptions(),
                stakeController.startSubscriptions(),
            ])

            const { selectedConnection } = connectionController.state
            const description = connectionController.getCurrentNetworkDescription()

            this._notifyAllConnections({
                method: 'networkChanged',
                params: {
                    networkId: description.globalId,
                    selectedConnection: selectedConnection.group,
                    connectionId: selectedConnection.connectionId,
                } as any, // TODO: event api?
            })

            this._sendUpdate()
        }

        return false
    }

    public async importStorage(data: string): Promise<boolean> {
        try {
            const { storage, accountsStorage, keyStore, accountController, contactsController } = this._components

            await storage.import(data)
            await accountsStorage.reload()
            await keyStore.reload()
            await storage.load()

            contactsController.initialSync()
            await accountController.initialSync()
            await this.changeNetwork()

            return true
        }
        catch (e) {
            log.error(e)
            return false
        }
    }

    public exportStorage(): Promise<string> {
        return this._components.storage.export()
    }

    public async logOut() {
        await this._components.accountController.logOut()
        await this._components.permissionsController.clear()
        await this._components.nftController.clear()

        this._notifyAllConnections({
            method: 'loggedOut',
            params: {},
        })
    }

    public async showApprovalRequest(tabId: number, frameId?: number) {
        await this.tempStorageInsert<PendingApprovalInfo>('pendingApprovalInfo', {
            tabId,
            frameId,
        })

        this._options.openExternalWindow({
            group: 'approval',
            force: false,
            owner: `${tabId}_${frameId ?? ''}`,
        })
    }

    private _sendPhishingWarning(mux: ObjectMultiplex, hostname: string) {
        const phishingStream = mux.createStream(PHISHING)
        phishingStream.write({ hostname })
    }

    private _setupControllerConnection<T extends Duplex>(outStream: T) {
        const api = this.getApi()

        this._components.counters.activeControllerConnections += 1
        this.emit(
            'controllerConnectionChanged',
            this._components.counters.activeControllerConnections
            + this._components.counters.reservedControllerConnections,
        )
        this._components.counters.reservedControllerConnections = 0

        outStream.on('data', createMetaRPCHandler(api, outStream))

        const handleUpdate = (params: unknown) => {
            if (outStream.destroyed) return

            try {
                outStream.write({
                    jsonrpc: '2.0',
                    method: 'sendUpdate',
                    params,
                })
            }
            catch (e: any) {
                log.error(e)
            }
        }
        const handleEvent = (params: unknown) => {
            if (outStream.destroyed) return

            try {
                outStream.write({
                    jsonrpc: '2.0',
                    method: 'sendEvent',
                    params,
                })
            }
            catch (e: any) {
                log.error(e)
            }
        }

        this.on('update', handleUpdate)
        this.on('event', handleEvent)

        outStream.on('end', () => {
            this._components.counters.activeControllerConnections -= 1
            this.emit(
                'controllerConnectionChanged',
                this._components.counters.activeControllerConnections
                + this._components.counters.reservedControllerConnections,
            )
            this.removeListener('update', handleUpdate)
            this.removeListener('event', handleEvent)
        })
    }

    private _setupProviderConnection<T extends Duplex>(
        outStream: T,
        sender: browser.Runtime.MessageSender,
        isInternal: boolean,
    ) {
        const origin = isInternal ? 'nekoton' : new URL(sender.url || 'unknown').origin
        let extensionId
        if (sender.id !== browser.runtime.id) {
            extensionId = sender.id
        }
        let tabId: number | undefined
        if (sender.tab && sender.tab.id) {
            tabId = sender.tab.id
        }

        const engine = this._setupProviderEngine({
            origin,
            location: sender.url,
            extensionId,
            tabId,
            isInternal,
            frameId: sender.frameId,
        })

        const providerStream = createEngineStream({ engine })

        const connectionId = this._addConnection(origin, tabId, { engine })

        pump(outStream, providerStream, outStream, e => {
            log.trace('providerStream closed')

            engine.destroy()

            if (connectionId) {
                this._removeConnection(origin, tabId, connectionId)
            }

            if (e) {
                log.error(e)
            }
        })
    }

    private _setupProviderEngine({ origin, tabId, frameId }: SetupProviderEngineOptions) {
        const engine = new JsonRpcEngine()

        engine.push(createOriginMiddleware({ origin }))
        if (typeof tabId === 'number') {
            engine.push(createTabIdMiddleware({ tabId }))
        }

        if (typeof tabId === 'number') {
            engine.push(createShowApprovalMiddleware(() => this.showApprovalRequest(tabId, frameId)))
        }

        engine.push(
            createHelperMiddleware({
                origin,
                nekoton: this._components.nekoton,
                clock: this._components.clock,
                accountController: this._components.accountController,
                permissionsController: this._components.permissionsController,
            }),
        )

        return engine
    }

    private _addConnection(
        origin: string,
        tabId: number | undefined,
        { engine }: AddConnectionOptions,
    ) {
        if (origin === 'nekoton') {
            return null
        }

        const id = nanoid()
        this._connections[id] = {
            engine,
        }

        let originIds = this._originToConnectionIds[origin]
        if (originIds == null) {
            originIds = new Set()
            this._originToConnectionIds[origin] = originIds
        }
        originIds.add(id)

        if (tabId != null) {
            let tabIds = this._tabToConnectionIds[tabId]
            if (tabIds == null) {
                tabIds = new Set()
                this._tabToConnectionIds[tabId] = tabIds
            }
            tabIds.add(id)

            let originTabs = this._originToTabIds[origin]
            if (originTabs == null) {
                originTabs = new Set()
                this._originToTabIds[origin] = originTabs
            }
            originTabs.add(tabId)
        }

        return id
    }

    private _removeConnection(origin: string, tabId: number | undefined, id: string) {
        delete this._connections[id]

        const originIds = this._originToConnectionIds[origin]
        if (originIds != null) {
            originIds.delete(id)
            if (originIds.size === 0) {
                delete this._originToConnectionIds[origin]
            }
        }

        if (tabId != null) {
            const tabIds = this._tabToConnectionIds[tabId]
            if (tabIds != null) {
                tabIds.delete(id)
                if (tabIds.size === 0) {
                    delete this._tabToConnectionIds[tabId]
                }
            }

            const originTabs = this._originToTabIds[origin]
            if (originTabs != null) {
                originTabs.delete(tabId)
                if (originTabs.size === 0) {
                    delete this._originToTabIds[origin]
                }
            }
        }
    }

    private _getOriginTabs(origin: string) {
        const tabIds = this._originToTabIds[origin]
        return tabIds ? Array.from(tabIds.values()) : []
    }

    private _notifyTab<T extends ProviderEvent>(
        tabId: number,
        payload: { method: T; params: RawProviderEventData<T> },
    ) {
        const tabIds = this._tabToConnectionIds[tabId]
        if (tabIds) {
            tabIds.forEach(id => {
                this._connections[id]?.engine.emit('notification', payload)
            })
        }
    }

    private _notifyConnections<T extends ProviderEvent>(
        origin: string,
        payload: { method: T; params: RawProviderEventData<T> },
    ) {
        const originIds = this._originToConnectionIds[origin]
        if (originIds) {
            originIds.forEach(id => {
                this._connections[id]?.engine.emit('notification', payload)
            })
        }
    }

    private _notifyAllConnections<T extends ProviderEvent>(payload: { method: T; params: RawProviderEventData<T> }) {
        Object.values(this._connections).forEach(({ engine }) => {
            engine.emit('notification', payload)
        })
    }

    private _debouncedSendUpdate = debounce(this._sendUpdate, 200, {
        leading: true,
        trailing: true,
    })

    private _sendUpdate() {
        this.emit('update', this.getState())
    }

    private _sendEvent(params: RpcEvent) {
        this.emit('event', params)
    }

}

interface AddConnectionOptions {
    engine: JsonRpcEngine;
}

interface CreateOriginMiddlewareOptions {
    origin: string;
}

const createOriginMiddleware = ({
    origin,
}: CreateOriginMiddlewareOptions): JsonRpcMiddleware<unknown, unknown> => (req, _res, next, _end) => {
    (req as any).origin = origin
    next()
}

interface CreateTabIdMiddlewareOptions {
    tabId: number;
}

const createTabIdMiddleware = ({
    tabId,
}: CreateTabIdMiddlewareOptions): JsonRpcMiddleware<unknown, unknown> => (req, _res, next, _end) => {
    (req as any).tabId = tabId
    next()
}

const createShowApprovalMiddleware = (
    showApprovalRequest: () => Promise<void>,
): JsonRpcMiddleware<unknown, unknown> => async (req, res, next, end) => {
    if (req.method === 'showApprovalRequest') {
        await showApprovalRequest()
        res.result = null
        end()
    }
    else {
        next()
    }
}
