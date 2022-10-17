import type nt from '@wallet/nekoton-wasm'
import { EventEmitter } from 'events'
import type { ProviderEvent, RawProviderEventData } from 'everscale-inpage-provider'
import debounce from 'lodash.debounce'
import { nanoid } from 'nanoid'
import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import { Duplex } from 'readable-stream'
import browser from 'webextension-polyfill'

import {
    createEngineStream,
    createMetaRPCHandler,
    JsonRpcEngine,
    JsonRpcMiddleware,
    NEKOTON_CONTROLLER,
    NEKOTON_PROVIDER,
    nodeifyAsync,
} from '@app/shared'
import {
    ConnectionDataItem,
    ExternalWindowParams,
    Nekoton,
    TriggerUiParams,
    WalletMessageToSend,
    WindowInfo,
} from '@app/models'
import { createHelperMiddleware } from '@app/background/middleware/helperMiddleware'

import { LedgerBridge, LedgerConnector, LedgerRpcClient } from '../ledger'
import { focusTab, focusWindow, openExtensionInBrowser } from '../utils/platform'
import { StorageConnector } from '../utils/StorageConnector'
import { WindowManager } from '../utils/WindowManager'
import { ContractFactory } from '../utils/Contract'
import { AccountController } from './AccountController/AccountController'
import { ConnectionController } from './ConnectionController'
import { LocalizationController } from './LocalizationController'
import { NotificationController } from './NotificationController'
import { PermissionsController } from './PermissionsController'
import { StakeController } from './StakeController'

export interface NekotonControllerOptions {
    windowManager: WindowManager;
    openExternalWindow: (params: TriggerUiParams) => void;
    getOpenNekotonTabIds: () => { [id: number]: true };
}

interface NekotonControllerComponents {
    nekoton: Nekoton,
    counters: Counters;
    storage: nt.Storage;
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
    ledgerRpcClient: LedgerRpcClient;
}

interface SetupProviderEngineOptions {
    origin: string;
    location?: string;
    extensionId?: string;
    tabId?: number;
    isInternal: boolean;
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

    private readonly accountsStorageKey: string

    private readonly keystoreStorageKey: string

    public static async load(options: NekotonControllerOptions): Promise<NekotonController> {
        const nekoton = await import('@wallet/nekoton-wasm') as Nekoton
        const counters = new Counters()
        const storage = new nekoton.Storage(new StorageConnector())
        const accountsStorage = await nekoton.AccountsStorage.load(storage)

        const ledgerRpcClient = new LedgerRpcClient()
        const ledgerBridge = new LedgerBridge(ledgerRpcClient)
        const ledgerConnection = new nekoton.LedgerConnection(new LedgerConnector(ledgerBridge))

        const keyStore = await nekoton.KeyStore.load(storage, ledgerConnection)
        setInterval(() => {
            keyStore.refreshPasswordCache()
        }, 10000)

        const clock = new nekoton.ClockWithOffset()

        const connectionController = new ConnectionController({
            nekoton,
            clock,
        })

        const notificationController = new NotificationController({
            disabled: false,
        })

        const localizationController = new LocalizationController({})

        const contractFactory = new ContractFactory(nekoton, clock, connectionController)
        const accountController = new AccountController({
            nekoton,
            clock,
            accountsStorage,
            keyStore,
            connectionController,
            notificationController,
            localizationController,
            ledgerBridge,
            contractFactory,
        })

        const permissionsController = new PermissionsController({})

        const stakeController = new StakeController({
            nekoton,
            clock,
            connectionController,
            accountController,
            contractFactory,
        })

        await localizationController.initialSync()
        await connectionController.initialSync()
        await accountController.initialSync()
        await permissionsController.initialSync()
        await stakeController.initialSync()

        if (connectionController.initialized) {
            await accountController.startSubscriptions()
            await stakeController.startSubscriptions()
        }

        return new NekotonController(options, {
            windowManager: options.windowManager,
            nekoton,
            counters,
            storage,
            accountsStorage,
            keyStore,
            clock,
            accountController,
            connectionController,
            localizationController,
            notificationController,
            permissionsController,
            stakeController,
            ledgerRpcClient,
        })
    }

    private constructor(
        options: NekotonControllerOptions,
        components: NekotonControllerComponents,
    ) {
        super()
        this.accountsStorageKey = components.nekoton.accountsStorageKey()
        this.keystoreStorageKey = components.nekoton.keystoreStorageKey()
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

        this._components.permissionsController.config.notifyDomain = this._notifyConnections.bind(this)

        this.on('controllerConnectionChanged', (activeControllerConnections: number) => {
            if (activeControllerConnections > 0) {
                this._components.accountController.enableIntensivePolling()
                this._components.notificationController.setHidden(true)
            }
            else {
                this._components.accountController.disableIntensivePolling()
                this._components.notificationController.setHidden(false)
            }
        })
    }

    public setupTrustedCommunication(mux: ObjectMultiplex): void {
        this._setupControllerConnection(mux.createStream(NEKOTON_CONTROLLER))
        this._components.ledgerRpcClient.addStream(mux.createStream('ledger'))
    }

    public setupUntrustedCommunication(
        mux: ObjectMultiplex,
        sender: browser.Runtime.MessageSender,
    ): void {
        this._setupProviderConnection(mux.createStream(NEKOTON_PROVIDER), sender, false)
    }

    public getApi() {
        const {
            windowManager,
            accountController,
            connectionController,
            localizationController,
            stakeController,
        } = this._components

        return {
            initialize: async (windowId: number | undefined, cb: ApiCallback<WindowInfo>) => {
                const group = windowId != null ? windowManager.getGroup(windowId) : undefined
                let approvalTabId: number | undefined

                if (group === 'approval') {
                    approvalTabId = await this.tempStorageRemove<number>('pendingApprovalTabId')
                }

                cb(null, {
                    group,
                    approvalTabId,
                })
            },
            getState: (cb: ApiCallback<ReturnType<typeof NekotonController.prototype.getState>>) => {
                cb(null, this.getState())
            },
            getAvailableNetworks: (cb: ApiCallback<ConnectionDataItem[]>) => {
                cb(null, connectionController.getAvailableNetworks())
            },
            openExtensionInBrowser: (
                params: { route?: string; query?: string },
                cb: ApiCallback<undefined>,
            ) => {
                const existingTabs = Object.keys(this._options.getOpenNekotonTabIds())
                if (existingTabs.length === 0) {
                    openExtensionInBrowser(params.route, params.query).then(() => cb(null))
                }
                else {
                    focusTab(existingTabs[0]).then(async tab => {
                        if (tab && tab.windowId != null) {
                            await focusWindow(tab.windowId)
                        }
                        cb(null)
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
            tempStorageInsert: nodeifyAsync(this, 'tempStorageInsert'),
            tempStorageRemove: nodeifyAsync(this, 'tempStorageRemove'),
            changeNetwork: nodeifyAsync(this, 'changeNetwork'),
            importStorage: nodeifyAsync(this, 'importStorage'),
            exportStorage: nodeifyAsync(this, 'exportStorage'),
            checkPassword: nodeifyAsync(accountController, 'checkPassword'),
            isPasswordCached: nodeifyAsync(accountController, 'isPasswordCached'),
            createMasterKey: nodeifyAsync(accountController, 'createMasterKey'),
            selectMasterKey: nodeifyAsync(accountController, 'selectMasterKey'),
            exportMasterKey: nodeifyAsync(accountController, 'exportMasterKey'),
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
            setLocale: nodeifyAsync(localizationController, 'setLocale'),
            createAccount: nodeifyAsync(accountController, 'createAccount'),
            createAccounts: nodeifyAsync(accountController, 'createAccounts'),
            ensureAccountSelected: nodeifyAsync(accountController, 'ensureAccountSelected'),
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
            prepareTransferMessage: nodeifyAsync(accountController, 'prepareTransferMessage'),
            prepareConfirmMessage: nodeifyAsync(accountController, 'prepareConfirmMessage'),
            prepareDeploymentMessage: nodeifyAsync(accountController, 'prepareDeploymentMessage'),
            prepareTokenMessage: nodeifyAsync(accountController, 'prepareTokenMessage'),
            sendMessage: (address: string, args: WalletMessageToSend, cb: ApiCallback<void>) => {
                accountController
                    .sendMessage(address, args)
                    .then(() => cb(null))
                    .catch((e) => cb(e))
            },
            preloadTransactions: nodeifyAsync(accountController, 'preloadTransactions'),
            preloadTokenTransactions: nodeifyAsync(accountController, 'preloadTokenTransactions'),
            resolveDensPath: nodeifyAsync(accountController, 'resolveDensPath'),
            getStakeDetails: nodeifyAsync(stakeController, 'getStakeDetails'),
            getDepositStEverAmount: nodeifyAsync(stakeController, 'getDepositStEverAmount'),
            getWithdrawEverAmount: nodeifyAsync(stakeController, 'getWithdrawEverAmount'),
            encodeDepositPayload: nodeifyAsync(stakeController, 'encodeDepositPayload'),
            setStakeBannerState: nodeifyAsync(stakeController, 'setStakeBannerState'),
            getStEverBalance: nodeifyAsync(stakeController, 'getStEverBalance'),
            prepareStEverMessage: nodeifyAsync(stakeController, 'prepareStEverMessage'),
        }
    }

    public getState() {
        return {
            ...this._components.accountController.state,
            ...this._components.connectionController.state,
            ...this._components.localizationController.state,
            ...this._components.stakeController.state,
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

    public async changeNetwork(connectionDataItem?: ConnectionDataItem) {
        let params = connectionDataItem
        const currentNetwork = this._components.connectionController.state.selectedConnection

        if (params == null) {
            params = currentNetwork
        }
        else if (currentNetwork.connectionId === params.connectionId) {
            return
        }

        await this._components.accountController.stopSubscriptions()
        await this._components.stakeController.stopSubscriptions()
        console.debug('Stopped account subscriptions')

        try {
            await this._components.connectionController.trySwitchingNetwork(params, true)
        }
        catch (e: any) {
            await this._components.connectionController.trySwitchingNetwork(currentNetwork, true)
        }
        finally {
            await this._components.accountController.startSubscriptions()
            await this._components.stakeController.startSubscriptions()

            const { selectedConnection } = this._components.connectionController.state

            this._notifyAllConnections({
                method: 'networkChanged',
                params: {
                    networkId: selectedConnection.networkId,
                    selectedConnection: selectedConnection.group,
                },
            })

            this._sendUpdate()
        }
    }

    public async importStorage(storage: string) {
        const parsedStorage = JSON.parse(storage)
        if (typeof parsedStorage !== 'object' || parsedStorage == null) {
            return false
        }

        const { masterKeysNames } = parsedStorage
        if (masterKeysNames != null && typeof masterKeysNames !== 'object') {
            return false
        }

        const { recentMasterKeys } = parsedStorage
        if (recentMasterKeys != null && !Array.isArray(recentMasterKeys)) {
            return false
        }

        const { accountsVisibility } = parsedStorage
        if (accountsVisibility != null && typeof accountsVisibility !== 'object') {
            return false
        }

        const { externalAccounts } = parsedStorage
        if (externalAccounts != null && !Array.isArray(externalAccounts)) {
            return false
        }

        const accounts = parsedStorage[this.accountsStorageKey]
        if (typeof accounts !== 'string' || !this._components.nekoton.AccountsStorage.verify(accounts)) {
            return false
        }

        const keystore = parsedStorage[this.keystoreStorageKey]
        if (typeof keystore !== 'string' || !this._components.nekoton.KeyStore.verify(keystore)) {
            return false
        }

        const result = {
            masterKeysNames: masterKeysNames != null ? masterKeysNames : {},
            recentMasterKeys: recentMasterKeys != null ? recentMasterKeys : [],
            accountsVisibility: accountsVisibility != null ? accountsVisibility : {},
            externalAccounts: externalAccounts != null ? externalAccounts : [],
            selectedAccountAddress: undefined,
            selectedMasterKey: undefined,
            permissions: {},
            domainMetadata: {},
            [this.accountsStorageKey]: accounts,
            [this.keystoreStorageKey]: keystore,
        }

        await browser.storage.local.set(result)

        await this._components.accountsStorage.reload()
        await this._components.keyStore.reload()

        await this._components.accountController.initialSync()
        await this.changeNetwork()

        return true
    }

    public async exportStorage(): Promise<string> {
        const result = await browser.storage.local.get([
            'masterKeysNames',
            'recentMasterKeys',
            'accountsVisibility',
            'externalAccounts',
            this.accountsStorageKey,
            this.keystoreStorageKey,
        ])
        return JSON.stringify(result, undefined, 2)
    }

    public async logOut() {
        await this._components.accountController.logOut()
        await this._components.permissionsController.clear()

        this._notifyAllConnections({
            method: 'loggedOut',
            params: {},
        })
    }

    public async showApprovalRequest(tabId: number) {
        await this.tempStorageInsert('pendingApprovalTabId', tabId)

        this._options.openExternalWindow({
            group: 'approval',
            force: false,
            singleton: false,
        })
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
                console.error(e)
            }
        }

        this.on('update', handleUpdate)

        outStream.on('end', () => {
            this._components.counters.activeControllerConnections -= 1
            this.emit(
                'controllerConnectionChanged',
                this._components.counters.activeControllerConnections
                + this._components.counters.reservedControllerConnections,
            )
            this.removeListener('update', handleUpdate)
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
        })

        const providerStream = createEngineStream({ engine })

        const connectionId = this._addConnection(origin, tabId, { engine })

        pump(outStream, providerStream, outStream, e => {
            console.debug('providerStream closed')

            engine.destroy()

            if (connectionId) {
                this._removeConnection(origin, tabId, connectionId)
            }

            if (e) {
                console.error(e)
            }
        })
    }

    private _setupProviderEngine({ origin, tabId }: SetupProviderEngineOptions) {
        const engine = new JsonRpcEngine()

        engine.push(createOriginMiddleware({ origin }))
        if (typeof tabId === 'number') {
            engine.push(createTabIdMiddleware({ tabId }))
        }

        if (typeof tabId === 'number') {
            engine.push(createShowApprovalMiddleware(() => this.showApprovalRequest(tabId)))
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
