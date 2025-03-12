import { Mutex } from '@broxus/await-semaphore'
import type * as nt from '@broxus/ever-wallet-wasm'
import type { GqlConnection, JrpcConnection, ProtoConnection } from 'everscale-inpage-provider'
import log from 'loglevel'
import browser from 'webextension-polyfill'
import isEqual from 'lodash.isequal'

import { delay, JETTON_GQL_ENDPOINT, NekotonRpcError, RpcErrorCode, throwError, TOKENS_MANIFEST_URL, NETWORK_ID, NETWORK_GROUP } from '@app/shared'
import { ConnectionData, ConnectionDataItem, Nekoton, NetworkType, UpdateCustomNetwork } from '@app/models'

import { FetchCache } from '../utils/FetchCache'
import { Deserializers, Storage } from '../utils/Storage'
import { GqlSocket, JrpcSocket, ProtoSocket } from '../socket'
import { BaseConfig, BaseController, BaseState } from './BaseController'

const DEFAULT_PRESETS: Record<number, ConnectionData> = {
    [NETWORK_ID.EVERSCALE]: {
        network: 'everscale',
        name: 'Everscale',
        group: NETWORK_GROUP.MAINNET_EVERSCALE,
        type: 'jrpc',
        data: {
            endpoint: 'https://jrpc.everwallet.net',
        },
        config: {
            symbol: 'EVER',
            explorerBaseUrl: 'https://everscan.io',
            tokensManifestUrl: TOKENS_MANIFEST_URL,
            decimals: 9,
        },
    },
    [NETWORK_ID.VENOM]: {
        network: 'venom',
        name: 'Venom',
        group: NETWORK_GROUP.MAINNET_VENOM,
        type: 'proto',
        data: {
            endpoint: 'https://jrpc.venom.foundation',
        },
        config: {
            symbol: 'VENOM',
            explorerBaseUrl: 'https://venomscan.com',
            tokensManifestUrl: 'https://cdn.venom.foundation/assets/mainnet/manifest.json',
            decimals: 9,
        },
    },
    [NETWORK_ID.TYCHO_TESTNET]: {
        network: 'tycho',
        name: 'Tycho Testnet',
        group: NETWORK_GROUP.TESTNET_TYCHO,
        type: 'proto',
        data: {
            endpoint: 'https://rpc-testnet.tychoprotocol.com/proto',
        },
        config: {
            explorerBaseUrl: 'https://testnet.tychoprotocol.com',
            tokensManifestUrl: 'https://raw.githubusercontent.com/broxus/ton-assets/refs/heads/tychotestnet/manifest.json',
            symbol: 'TYCHO',
            decimals: 9,
        },
    },
    [NETWORK_ID.TON]: {
        network: 'ton',
        name: 'TON',
        group: NETWORK_GROUP.TON,
        type: 'jrpc',
        data: {
            endpoint: 'https://jrpc-ton.broxus.com',
        },
        config: {
            explorerBaseUrl: 'https://tonviewer.com',
            tokensManifestUrl: 'https://raw.githubusercontent.com/broxus/ton-assets/refs/heads/ton-prod/manifest.json',
            symbol: 'TON',
            decimals: 9,
        },
    },
    [NETWORK_ID.HAMSTER]: {
        network: 'hamster',
        name: 'Hamster Network',
        group: NETWORK_GROUP.HAMSTER,
        type: 'proto',
        data: {
            endpoint: 'https://rpc.hamster.network',
        },
        config: {
            explorerBaseUrl: 'https://hamsterscan.io',
            tokensManifestUrl: 'https://raw.githubusercontent.com/broxus/ton-assets/refs/heads/hmstr/manifest.json',
            symbol: 'HMSTR',
            decimals: 9,
        },
    },
    [NETWORK_ID.HUMO]: {
        network: 'humo',
        name: 'Humo Network',
        group: NETWORK_GROUP.HUMO,
        type: 'proto',
        data: {
            endpoint: 'https://rpc.humonetwork.com',
        },
        config: {
            explorerBaseUrl: 'https://humoscan.com/',
            symbol: 'HUMO',
            decimals: 6,
        },
    },
}

export interface ConnectionConfig extends BaseConfig {
    origin?: string;
    nekoton: Nekoton;
    clock: nt.ClockWithOffset;
    cache: FetchCache;
    storage: Storage<ConnectionStorage>;
}

export interface ConnectionControllerState extends BaseState {
    clockOffset: number;
    selectedConnection: ConnectionDataItem;
    pendingConnection: ConnectionDataItem | undefined;
    failedConnection: ConnectionDataItem | undefined;
    networks: Record<number, ConnectionData>;
}

function makeDefaultState(): ConnectionControllerState {
    return {
        clockOffset: 0,
        selectedConnection: {
            ...DEFAULT_PRESETS[0],
            connectionId: 0,
        },
        pendingConnection: undefined,
        failedConnection: undefined,
        networks: DEFAULT_PRESETS,
    }
}

interface INetworkSwitchHandle {
    // Must be called after all connection usages are gone
    switch(): Promise<void>;
}

export class ConnectionController extends BaseController<ConnectionConfig, ConnectionControllerState> {

    private _customNetworks: Record<number, ConnectionData> = {}

    private _descriptions: Record<number, nt.NetworkDescription> = {}

    private _initializedConnection?: InitializedConnection

    // Used to prevent network switch during some working subscriptions
    private _networkMutex: Mutex

    private _release?: () => void

    private _acquiredConnectionCounter: number = 0

    private _cancelTestConnection?: () => void

    // Used for Jetton library cells download
    private _gqlConnection: nt.GqlConnection | null = null

    constructor(
        config: ConnectionConfig,
        state?: ConnectionControllerState,
    ) {
        super(config, state || makeDefaultState())

        this._initializedConnection = undefined
        this._networkMutex = new Mutex()
        this.initialize()

        this._handleStorageChanged = this._handleStorageChanged.bind(this)
    }

    public get initialized(): boolean {
        return !!this._initializedConnection
    }

    public async initialSync() {
        if (this._initializedConnection) {
            throw new Error('Must not sync twice')
        }

        const { storage } = this.config

        this._customNetworks = storage.snapshot.customNetworks ?? {}
        this._descriptions = storage.snapshot.networkDescriptions ?? {}

        this._updateNetworks()

        await this._prepareTimeSync()

        let retry = 0
        const loadedConnectionId = storage.snapshot.selectedConnectionId ?? 0

        while (retry++ <= 2) {
            const selectedConnection = this._getPreset(loadedConnectionId)
            if (selectedConnection != null) {
                this.update({ selectedConnection, pendingConnection: undefined })
            }

            try {
                await this.trySwitchingNetwork(this.state.selectedConnection, true)
                break
            }
            catch (_e) {
                log.error('Failed to select initial connection. Retrying in 5s')
            }

            if (retry <= 2) {
                await delay(5000)
                log.trace('Restarting connection process')
            }
        }

        if (!this._initializedConnection) {
            this.markSelectedConnectionAsFailed()
        }

        this._updateNetworkDescriptions().catch(log.error)

        if (this.config.origin) {
            // started from inpage provider
            this._subscribeOnStorageChanged()
        }
    }

    public async reload(): Promise<void> {
        this._customNetworks = await this.config.storage.get('customNetworks') ?? {}
        this._descriptions = await this.config.storage.get('networkDescriptions') ?? {}
        this._updateNetworks()
    }

    public async startSwitchingNetwork(params: ConnectionDataItem): Promise<INetworkSwitchHandle> {
        class NetworkSwitchHandle implements INetworkSwitchHandle {

            private readonly _controller: ConnectionController

            private readonly _release: () => void

            private readonly _params: ConnectionDataItem

            constructor(
                controller: ConnectionController,
                release: () => void,
                params: ConnectionDataItem,
            ) {
                this._controller = controller
                this._release = release
                this._params = params

                this._controller.update({
                    pendingConnection: params,
                })
            }

            public async switch() {
                await this._controller
                    ._connect(this._params)
                    .then(() => {
                        this._controller.update({
                            selectedConnection: this._params,
                            pendingConnection: undefined,
                            failedConnection: undefined,
                        })
                    })
                    .catch(e => {
                        this._controller.update({
                            pendingConnection: undefined,
                        })
                        throw e
                    })
                    .finally(() => this._release())
            }

        }

        this._cancelTestConnection?.()

        const release = await this._networkMutex.acquire()
        return new NetworkSwitchHandle(this, release, params)
    }

    public async acquire() {
        requireInitializedConnection(this._initializedConnection)
        await this._acquireConnection()

        return {
            connection: this._initializedConnection,
            release: () => this._releaseConnection(),
        }
    }

    public async use<T>(f: (connection: InitializedConnection) => Promise<T>): Promise<T> {
        requireInitializedConnection(this._initializedConnection)
        await this._acquireConnection()

        return f(this._initializedConnection)
            .finally(() => this._releaseConnection())
    }

    public getAvailableNetworks(): ConnectionDataItem[] {
        return Object.entries(this.state.networks).map(([id, value]) => ({
            ...(value as ConnectionData),
            connectionId: parseInt(id, 10),
            description: this._descriptions[parseInt(id, 10)],
        }))
    }

    public makeAvailableNetworksGroup(first: ConnectionDataItem): ConnectionDataItem[] {
        const { networks } = this.state
        const availableConnections = [first]
        availableConnections.push(
            ...Object.entries(networks)
                .filter(([id, item]) => parseInt(id, 10) !== first.connectionId && item.group === first.group)
                .map(([id, item]) => ({
                    ...item,
                    connectionId: parseInt(id, 10),
                })),
        )
        return availableConnections
    }

    public async trySwitchingNetwork(first: ConnectionDataItem, allowOtherConnections: boolean) {
        const availableConnections = allowOtherConnections
            ? this.makeAvailableNetworksGroup(first)
            : [first]

        log.trace(availableConnections)

        for (const connection of availableConnections) {
            log.trace(`Connecting to ${connection.name} ...`)

            try {
                await this.startSwitchingNetwork(connection).then(handle => handle.switch())
                log.trace(`Successfully connected to ${this.state.selectedConnection.name}`)
                return
            }
            catch (e: any) {
                log.error('Connection failed:', e)
            }
        }

        throw new Error('Failed to find suitable connection')
    }

    public async updateCustomNetwork(update: UpdateCustomNetwork): Promise<ConnectionDataItem> {
        let { connectionId, ...params } = update, // eslint-disable-line prefer-const
            network: ConnectionData

        if (typeof connectionId === 'undefined') {
            // create new network
            connectionId = Math.max(
                1000,
                Object.keys(this._customNetworks)
                    .reduce((max, key) => Math.max(max, parseInt(key, 10)), 0) + 1,
            )
            network = {
                ...params,
                group: `custom-${connectionId}`,
                network: 'custom',
            }
        }
        else {
            // update network
            const oldNetwork = this._customNetworks[connectionId]
                ?? DEFAULT_PRESETS[connectionId]
                ?? throwError(new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, 'Network not found'))

            network = {
                ...oldNetwork,
                ...update,
            }
        }

        this._customNetworks[connectionId] = network

        await this._updateNetworkDescription({ ...network, connectionId })

        await this._saveCustomNetworks()
        await this._saveDescriptions()

        this._updateNetworks()

        return {
            ...network,
            description: this._descriptions[connectionId],
            connectionId,
        }
    }

    public async deleteCustomNetwork(connectionId: number): Promise<ConnectionDataItem | undefined> {
        const { selectedConnection } = this.state
        const network = this._customNetworks[connectionId]

        if (!network) return undefined

        if (selectedConnection.connectionId === connectionId && connectionId >= 1000) {
            throw new NekotonRpcError(RpcErrorCode.INTERNAL, 'Can\'t delete selected network')
        }

        delete this._customNetworks[connectionId]
        delete this._descriptions[connectionId]

        await this._saveCustomNetworks()
        await this._saveDescriptions()

        this._updateNetworks()

        return this.getAvailableNetworks().find((network) => network.connectionId === connectionId)
    }

    public async resetCustomNetworks(): Promise<void> {
        const { selectedConnection } = this.state

        if (!(selectedConnection.connectionId in DEFAULT_PRESETS)) {
            throw new NekotonRpcError(RpcErrorCode.INTERNAL, 'Custom network is selected')
        }

        this._customNetworks = {}
        this._descriptions = {}

        await this.config.storage.remove('customNetworks')
        await this.config.storage.remove('networkDescriptions')

        this._updateNetworks()
        this._updateNetworkDescriptions().catch(log.error)
    }

    public async getNetworkDescription(
        params: GqlConnection | JrpcConnection | ProtoConnection | any,
    ): Promise<nt.NetworkDescription> {
        if (!isSupportedConnection(params)) {
            throw new NekotonRpcError(
                RpcErrorCode.INVALID_REQUEST,
                'Unsupported connection type',
            )
        }

        let connection: InitializedConnection | null = null
        try {
            connection = await this._initializeConnection({
                ...params,
                name: 'tmp',
                group: 'tmp',
                network: 'custom',
                config: {},
            })

            return connection.description
        }
        finally {
            connection?.data.transport.free()
            connection?.data.connection.free()
        }
    }

    public getCurrentNetworkDescription(): nt.NetworkDescription {
        if (!this._initializedConnection) {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                'Connection not initialized',
            )
        }

        return this._initializedConnection.description
    }

    public markSelectedConnectionAsFailed(): void {
        this.update({
            failedConnection: this.state.selectedConnection,
        })
    }

    // NOTE: Used for Jetton library cells download
    public async getGqlConnection(): Promise<nt.GqlConnection> {
        if (!this._gqlConnection) {
            const { nekoton } = this.config

            const socket = new GqlSocket(nekoton)
            this._gqlConnection = await socket.connect({
                endpoints: [JETTON_GQL_ENDPOINT],
                latencyDetectionInterval: 60000,
                maxLatency: 60000,
                local: false,
            })
        }

        return this._gqlConnection
    }

    private async _prepareTimeSync() {
        const computeClockOffset = (): Promise<number> => new Promise<number>((resolve, reject) => {
            const now = Date.now()
            fetch('https://jrpc.everwallet.net')
                .then(body => {
                    const then = Date.now()
                    body.text().then(timestamp => {
                        const server = parseInt(timestamp, 10)
                        resolve(server - (now + then) / 2)
                    })
                })
                .catch(reject)
            setTimeout(() => reject(new Error('Clock offset resolution timeout')), 5000)
        }).catch(e => {
            log.warn('Failed to compute clock offset:', e)
            return 0
        })

        const updateClockOffset = async () => {
            const clockOffset = await computeClockOffset()
            log.trace(`Clock offset: ${clockOffset}`)
            this.config.clock.updateOffset(clockOffset)
            this.update({ clockOffset })
        }

        // NOTE: Update clock offset twice because first request is always too long
        await updateClockOffset()
        await updateClockOffset()

        let lastTime = Date.now()
        setInterval(() => {
            const currentTime = Date.now()
            if (Math.abs(currentTime - lastTime) > 2000) {
                updateClockOffset().catch(log.error)
            }
            lastTime = currentTime
        }, 1000)
    }

    private async _connect(params: ConnectionDataItem) {
        if (this._initializedConnection) {
            this._initializedConnection.data.transport.free()
            this._initializedConnection.data.connection.free()
        }

        // Free GqlConnection if it was created in case if it's not needed anymore
        this._gqlConnection?.free()

        this._initializedConnection = undefined
        this._gqlConnection = null

        if (params.type !== 'graphql' && params.type !== 'jrpc' && params.type !== 'proto') {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                'Unsupported connection type',
            )
        }

        let initializedConnection: InitializedConnection | undefined

        try {
            initializedConnection = await this._initializeConnection(params)
            const testResult = await this._testConnection(initializedConnection, getTestType(params))

            if (testResult === ConnectionTestResult.CANCELLED) {
                initializedConnection?.data.connection.free()
                return
            }

            this._initializedConnection = initializedConnection
            this._descriptions[params.connectionId] = this._initializedConnection.description

            await this._saveSelectedConnectionId(params.connectionId)
            await this._saveDescriptions()
        }
        catch (e: any) {
            initializedConnection?.data.connection.free()
            throw new NekotonRpcError(
                RpcErrorCode.INTERNAL,
                `Failed to create connection: ${e.toString()}`,
            )
        }
    }

    private async _initializeConnection(params: ConnectionData): Promise<InitializedConnection> {
        let initializedConnection: InitializedConnection
        const { nekoton, clock, cache, origin } = this.config

        switch (params.type) {
            case 'graphql': {
                const socket = new GqlSocket(nekoton, origin)
                const connection = await socket.connect(params.data)
                const transport = nekoton.Transport.fromGqlConnection(connection, clock)

                initializedConnection = {
                    description: await transport.getNetworkDescription(),
                    group: params.group,
                    network: params.network ?? 'custom',
                    type: 'graphql',
                    data: {
                        socket,
                        connection,
                        transport,
                    },
                }
                break
            }

            case 'jrpc': {
                const socket = new JrpcSocket(nekoton, cache, origin)
                const connection = await socket.connect(params.data)
                const transport = nekoton.Transport.fromJrpcConnection(connection, clock)

                initializedConnection = {
                    description: await transport.getNetworkDescription(),
                    group: params.group,
                    network: params.network ?? 'custom',
                    type: 'jrpc',
                    data: {
                        socket,
                        connection,
                        transport,
                    },
                }
                break
            }

            case 'proto': {
                const socket = new ProtoSocket(nekoton, cache, origin)
                const connection = await socket.connect(params.data)
                const transport = nekoton.Transport.fromProtoConnection(connection, clock)

                initializedConnection = {
                    description: await transport.getNetworkDescription(),
                    group: params.group,
                    network: params.network ?? 'custom',
                    type: 'proto',
                    data: {
                        socket,
                        connection,
                        transport,
                    },
                }
                break
            }

            default: throw new Error('Unknown connection type')
        }

        return initializedConnection
    }

    private async _acquireConnection() {
        log.trace('_acquireConnection')

        if (this._acquiredConnectionCounter > 0) {
            log.trace('_acquireConnection -> increase')
            this._acquiredConnectionCounter += 1
        }
        else {
            this._acquiredConnectionCounter = 1
            if (this._release != null) {
                log.warn('mutex is already acquired')
            }
            else {
                log.trace('_acquireConnection -> await')
                this._release = await this._networkMutex.acquire()
                log.trace('_acquireConnection -> create')
            }
        }
    }

    private _releaseConnection() {
        log.trace('_releaseConnection')

        this._acquiredConnectionCounter -= 1
        if (this._acquiredConnectionCounter <= 0) {
            log.trace('_releaseConnection -> release')
            this._release?.()
            this._release = undefined
        }
    }

    private _getPreset(id: number): ConnectionDataItem | undefined {
        const preset = this.state.networks[id]
        return preset ? {
            ...preset,
            connectionId: id,
        } : undefined
    }

    private _testConnection = (
        connection: InitializedConnection,
        testType: ConnectionTestType,
    ) => new Promise<ConnectionTestResult>(
        (resolve, reject) => {
            const {
                data: { transport },
            } = connection
            const address = testType === ConnectionTestType.Local
                ? '0:78fbd6980c10cf41401b32e9b51810415e7578b52403af80dae68ddf99714498'
                : '-1:0000000000000000000000000000000000000000000000000000000000000000'
            this._cancelTestConnection = () => resolve(ConnectionTestResult.CANCELLED)

            // Try to get any account state
            transport
                .getFullContractState(address)
                .then(() => resolve(ConnectionTestResult.DONE))
                .catch((e: any) => reject(e))

            setTimeout(() => reject(new Error('Connection timeout')), 10000)
        },
    ).finally(() => {
        this._cancelTestConnection = undefined
    })

    private async _updateNetworkDescriptions(): Promise<void> {
        const networks = this.getAvailableNetworks()

        for (const network of networks) {
            if (this._descriptions[network.connectionId]) continue
            await this._updateNetworkDescription(network)
        }

        await this._saveDescriptions()
    }

    private async _updateNetworkDescription(network: ConnectionDataItem): Promise<void> {
        let connection: InitializedConnection | null = null
        try {
            connection = await this._initializeConnection(network)
            this._descriptions[network.connectionId] = connection.description
        }
        catch (e) {
            log.warn('Get network description failed', network, e)
        }
        finally {
            connection?.data.transport.free()
            connection?.data.connection.free()
        }
    }

    private _saveSelectedConnectionId(connectionId: number): Promise<void> {
        return this.config.storage.set({ selectedConnectionId: connectionId })
    }

    private _saveCustomNetworks(): Promise<void> {
        return this.config.storage.set({ customNetworks: this._customNetworks })
    }

    private _saveDescriptions(): Promise<void> {
        return this.config.storage.set({ networkDescriptions: this._descriptions })
    }

    private _updateNetworks(): void {
        Object.values(this._customNetworks).forEach((network) => {
            network.custom = true
        })

        this.update({
            networks: {
                ...DEFAULT_PRESETS,
                ...this._customNetworks,
            },
        })
    }

    private _subscribeOnStorageChanged() {
        browser.storage.local.onChanged.addListener(this._handleStorageChanged)
    }

    /**
     * Sync network changes with standalone (created from inpage provider) controller
     */
    private _handleStorageChanged(changes: browser.Storage.StorageAreaOnChangedChangesType) {
        if (typeof changes.customNetworks?.newValue === 'object') {
            const newValue = changes.customNetworks.newValue ?? {}

            if (!isEqual(this._customNetworks, newValue)) {
                this._customNetworks = newValue
                this._updateNetworks()
            }
        }

        if (typeof changes.networkDescriptions?.newValue === 'object') {
            const newValue = changes.networkDescriptions.newValue ?? {}

            if (!isEqual(this._descriptions, newValue)) {
                this._descriptions = newValue
            }
        }
    }

}

type InitializedConnection = { group: string; network: NetworkType; description: nt.NetworkDescription } & (
    | nt.EnumItem<'graphql', {
        socket: GqlSocket
        connection: nt.GqlConnection
        transport: nt.Transport
    }>
    | nt.EnumItem<'jrpc', {
        socket: JrpcSocket
        connection: nt.JrpcConnection
        transport: nt.Transport
    }>
    | nt.EnumItem<'proto', {
        socket: ProtoSocket
        connection: nt.ProtoConnection
        transport: nt.Transport
    }>
);

enum ConnectionTestType {
    Default,
    Local,
}

enum ConnectionTestResult {
    DONE,
    CANCELLED,
}

function requireInitializedConnection(
    connection?: InitializedConnection,
): asserts connection is InitializedConnection {
    if (connection == null) {
        throw new NekotonRpcError(
            RpcErrorCode.CONNECTION_IS_NOT_INITIALIZED,
            'Connection is not initialized',
        )
    }
}

function getTestType(params: ConnectionData): ConnectionTestType {
    return (params.type === 'graphql' && params.data.local) ? ConnectionTestType.Local : ConnectionTestType.Default
}

function isSupportedConnection(connection: any): connection is GqlConnection | JrpcConnection | ProtoConnection {
    return !!connection && (connection.type === 'graphql' || connection.type === 'jrpc' || connection.type === 'proto')
}

interface ConnectionStorage {
    selectedConnectionId: number;
    customNetworks: Record<number, ConnectionData>;
    networkDescriptions: Record<number, nt.NetworkDescription>;
}

Storage.register<ConnectionStorage>({
    selectedConnectionId: { deserialize: Deserializers.number },
    customNetworks: {
        exportable: true,
        deserialize: Deserializers.object,
        validate: (value: unknown) => !value || typeof value === 'object',
    },
    networkDescriptions: {
        deserialize: Deserializers.object,
        validate: (value: unknown) => !value || typeof value === 'object',
    },
})
