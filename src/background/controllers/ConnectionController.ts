import { Mutex } from '@broxus/await-semaphore'
import type * as nt from '@broxus/ever-wallet-wasm'
import type { GqlConnection, JrpcConnection, ProtoConnection } from 'everscale-inpage-provider'
import log from 'loglevel'
import browser from 'webextension-polyfill'
import isEqual from 'lodash.isequal'

import { delay, NekotonRpcError, RpcErrorCode, throwError, ConnectionConfig, NetworkData, NetworkType } from '@app/shared'
import { ConnectionData, ConnectionDataItem, Nekoton, SocketParams, UpdateCustomNetwork } from '@app/models'

import { FetchCache } from '../utils/FetchCache'
import { Deserializers, Storage } from '../utils/Storage'
import { GqlSocket, JrpcSocket, ProtoSocket } from '../socket'
import { BaseConfig, BaseController, BaseState } from './BaseController'

const getConnectionData = (networks: NetworkData[]) => networks.reduce((acc, item) => {
    acc[item.id] = item.type === 'graphql' ? { ...item, data: { endpoints: item.endpoints, local: false, latencyDetectionInterval: 60000, maxLatency: 100000 }} : { ...item, data: { endpoint: item.endpoint }}
    return acc
}, {} as Record<string, ConnectionData>)

function makeDefaultState(
    networks: Record<string, ConnectionData>,
    defaultConnectionId: string,
): ConnectionControllerState {
    return {
        clockOffset: 0,
        selectedConnection: networks[defaultConnectionId],
        pendingConnection: undefined,
        failedConnection: undefined,
        networks,
    }
}

export interface ConnectionControllerConfig extends BaseConfig {
    origin?: string;
    nekoton: Nekoton;
    clock: nt.ClockWithOffset;
    cache: FetchCache;
    storage: Storage<ConnectionStorage>;
    connectionConfig: ConnectionConfig;
}

export interface ConnectionControllerState extends BaseState {
    clockOffset: number;
    selectedConnection: ConnectionDataItem;
    pendingConnection: ConnectionDataItem | undefined;
    failedConnection: ConnectionDataItem | undefined;
    networks: Record<string, ConnectionData>;
}

interface INetworkSwitchHandle {
    // Must be called after all connection usages are gone
    switch(): Promise<void>;
}

export class ConnectionController extends BaseController<ConnectionControllerConfig, ConnectionControllerState> {

    private _customNetworks: Record<string, ConnectionData> = {}

    private _descriptions: Record<string, nt.NetworkDescription> = {}

    private _initializedConnection?: InitializedConnection

    // Used to prevent network switch during some working subscriptions
    private _networkMutex: Mutex

    private _release?: () => void

    private _acquiredConnectionCounter: number = 0

    private _cancelTestConnection?: () => void

    // Used for Jetton library cells download
    private _gqlConnection: nt.GqlConnection | null = null

    constructor(config: ConnectionControllerConfig, state?: ConnectionControllerState) {
        super(
            config,
            state || makeDefaultState(
                getConnectionData(config.connectionConfig.networks),
                config.connectionConfig.defaultConnectionId,
            ),
        )

        this._initializedConnection = undefined
        this._networkMutex = new Mutex()
        this.initialize()

        this._handleStorageChanged = this._handleStorageChanged.bind(this)
    }

    public get initialized(): boolean {
        return !!this._initializedConnection
    }

    public get connectionConfig(): ConnectionConfig {
        return this.config.connectionConfig
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
        const loadedConnectionId = storage.snapshot.selectedConnectionId ?? this.connectionConfig.defaultConnectionId

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
        this._customNetworks = (await this.config.storage.get('customNetworks')) ?? {}
        this._descriptions = (await this.config.storage.get('networkDescriptions')) ?? {}
        this._updateNetworks()
    }

    public async startSwitchingNetwork(params: ConnectionDataItem): Promise<INetworkSwitchHandle> {
        class NetworkSwitchHandle implements INetworkSwitchHandle {

            private readonly _controller: ConnectionController

            private readonly _release: () => void

            private readonly _params: ConnectionDataItem

            constructor(controller: ConnectionController, release: () => void, params: ConnectionDataItem) {
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
                    .catch((e) => {
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

        return f(this._initializedConnection).finally(() => this._releaseConnection())
    }

    public getAvailableNetworks(): ConnectionDataItem[] {
        return Object.entries(this.state.networks).map(([id, value]) => ({
            ...(value as ConnectionData),
            connectionId: parseInt(id, 10),
            description: this._descriptions[id],
        }))
    }

    public makeAvailableNetworksGroup(first: ConnectionDataItem): ConnectionDataItem[] {
        const { networks } = this.state
        const availableConnections = [first]
        availableConnections.push(
            ...Object.entries(networks)
                .filter(([id, item]) => id !== first.id && item.group === first.group)
                .map(([id, item]) => ({
                    ...item,
                    connectionId: parseInt(id, 10),
                })),
        )
        return availableConnections
    }

    public async trySwitchingNetwork(first: ConnectionDataItem, allowOtherConnections: boolean) {
        const availableConnections = allowOtherConnections ? this.makeAvailableNetworksGroup(first) : [first]

        log.trace(availableConnections)

        for (const connection of availableConnections) {
            log.trace(`Connecting to ${connection.name} ...`)

            try {
                await this.startSwitchingNetwork(connection).then((handle) => handle.switch())
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
        let network: ConnectionData = {} as ConnectionData
        let id = update.id!

        if (typeof id === 'undefined') {
            // create new network
            id = `custom${Object.keys(this._customNetworks)
                .filter((key) => key.startsWith('custom'))
                .map((key) => parseInt(key.replace('custom', ''), 10) || 0)
                .reduce((max, num) => Math.max(max, num), 0) + 1
            }`
            network = {
                ...update,
                id,
                group: `custom-${id}`,
                network: 'custom',
            } as ConnectionData
        }
        else {
            // update network
            const oldNetwork = this._customNetworks[id] ?? this.state.networks[id] ?? throwError(new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, 'Network not found'))

            network = {
                ...oldNetwork,
                ...update,
            } as ConnectionData
        }

        this._customNetworks[id] = network

        await this._updateNetworkDescription({ ...network, id })

        await this._saveCustomNetworks()
        await this._saveDescriptions()

        this._updateNetworks()

        return {
            ...network,
            description: this._descriptions[id],
            id,
        }
    }

    public async deleteCustomNetwork(connectionId: string): Promise<ConnectionDataItem | undefined> {
        const { selectedConnection } = this.state
        const network = this._customNetworks[connectionId]

        if (!network) return undefined

        if (selectedConnection.id === connectionId && network.network === 'custom') {
            throw new NekotonRpcError(RpcErrorCode.INTERNAL, "Can't delete selected network")
        }

        delete this._customNetworks[connectionId]
        delete this._descriptions[connectionId]

        await this._saveCustomNetworks()
        await this._saveDescriptions()

        this._updateNetworks()

        return this.getAvailableNetworks().find((network) => network.id === connectionId)
    }

    public async resetCustomNetworks(): Promise<void> {
        const { selectedConnection } = this.state

        if (!(selectedConnection.id in this.state.networks)) {
            throw new NekotonRpcError(RpcErrorCode.INTERNAL, 'Custom network is selected')
        }

        this._customNetworks = {}
        this._descriptions = {}

        await this.config.storage.remove('customNetworks')
        await this.config.storage.remove('networkDescriptions')

        this._updateNetworks()
        this._updateNetworkDescriptions().catch(log.error)
    }

    public async getNetworkDescription(params:
        GqlConnection | JrpcConnection | ProtoConnection | any): Promise<nt.NetworkDescription> {
        if (!isSupportedConnection(params)) {
            throw new NekotonRpcError(RpcErrorCode.INVALID_REQUEST, 'Unsupported connection type')
        }

        let connection: InitializedConnection | null = null
        try {
            connection = await this._initializeConnection({
                ...params,
                group: 'custom',
                network: 'custom',
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
            throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, 'Connection not initialized')
        }

        return this._initializedConnection.description
    }

    public markSelectedConnectionAsFailed(): void {
        this.update({
            failedConnection: this.state.selectedConnection,
        })
    }

    private async _prepareTimeSync() {
        const computeClockOffset = (): Promise<number> => new Promise<number>((resolve, reject) => {
            const now = Date.now()
            fetch('https://jrpc.everwallet.net')
                .then((body) => {
                    const then = Date.now()
                    body.text().then((timestamp) => {
                        const server = parseInt(timestamp, 10)
                        resolve(server - (now + then) / 2)
                    })
                })
                .catch(reject)
            setTimeout(() => reject(new Error('Clock offset resolution timeout')), 5000)
        }).catch((e) => {
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
            throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, 'Unsupported connection type')
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
            this._descriptions[params.id] = this._initializedConnection.description

            await this._saveSelectedConnectionId(params.id)
            await this._saveDescriptions()
        }
        catch (e: any) {
            initializedConnection?.data.connection.free()
            throw new NekotonRpcError(RpcErrorCode.INTERNAL, `Failed to create connection: ${e.toString()}`)
        }
    }

    private async _initializeConnection(params: Pick<ConnectionData, 'group' | 'network'> & SocketParams): Promise<InitializedConnection> {
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
                const connection = await socket.connect({ endpoint: params.data.endpoint })
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

            default:
                throw new Error('Unknown connection type')
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

    private _getPreset(id: string): ConnectionDataItem | undefined {
        const preset = this.state.networks[id]
        return preset
            ? {
                ...preset,
                id,
            }
            : undefined
    }

    private _testConnection = (
        connection: InitializedConnection,
        testType: ConnectionTestType,
    ) => new Promise<ConnectionTestResult>((resolve, reject) => {
        const {
            data: { transport },
        } = connection
        const address = testType === ConnectionTestType.Local ? '0:78fbd6980c10cf41401b32e9b51810415e7578b52403af80dae68ddf99714498' : '-1:0000000000000000000000000000000000000000000000000000000000000000'
        this._cancelTestConnection = () => resolve(ConnectionTestResult.CANCELLED)

        // Try to get any account state
        transport
            .getFullContractState(address)
            .then(() => resolve(ConnectionTestResult.DONE))
            .catch((e: any) => reject(e))

        setTimeout(() => reject(new Error('Connection timeout')), 10000)
    }).finally(() => {
        this._cancelTestConnection = undefined
    })

    private async _updateNetworkDescriptions(): Promise<void> {
        const networks = this.getAvailableNetworks()

        for (const network of networks) {
            if (this._descriptions[network.id]) continue
            await this._updateNetworkDescription(network)
        }

        await this._saveDescriptions()
    }

    private async _updateNetworkDescription(network: ConnectionDataItem): Promise<void> {
        let connection: InitializedConnection | null = null
        try {
            connection = await this._initializeConnection(network)
            this._descriptions[network.id] = connection.description
        }
        catch (e) {
            log.warn('Get network description failed', network, e)
        }
        finally {
            connection?.data.transport.free()
            connection?.data.connection.free()
        }
    }

    private _saveSelectedConnectionId(connectionId: string): Promise<void> {
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
                ...this.state.networks,
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
    | nt.EnumItem<
        'graphql',
        {
            socket: GqlSocket;
            connection: nt.GqlConnection;
            transport: nt.Transport;
        }
    >
    | nt.EnumItem<
        'jrpc',
        {
            socket: JrpcSocket;
            connection: nt.JrpcConnection;
            transport: nt.Transport;
        }
    >
    | nt.EnumItem<
        'proto',
        {
            socket: ProtoSocket;
            connection: nt.ProtoConnection;
            transport: nt.Transport;
        }
    >
);

enum ConnectionTestType {
    Default,
    Local,
}

enum ConnectionTestResult {
    DONE,
    CANCELLED,
}

function requireInitializedConnection(connection?: InitializedConnection): asserts connection is InitializedConnection {
    if (connection == null) {
        throw new NekotonRpcError(RpcErrorCode.CONNECTION_IS_NOT_INITIALIZED, 'Connection is not initialized')
    }
}

function getTestType(params: ConnectionData): ConnectionTestType {
    return params.type === 'graphql' && params.data.local ? ConnectionTestType.Local : ConnectionTestType.Default
}

function isSupportedConnection(connection: any): connection is GqlConnection | JrpcConnection | ProtoConnection {
    return !!connection && (connection.type === 'graphql' || connection.type === 'jrpc' || connection.type === 'proto')
}

interface ConnectionStorage {
    selectedConnectionId: string;
    customNetworks: Record<number, ConnectionData>;
    networkDescriptions: Record<number, nt.NetworkDescription>;
}

Storage.register<ConnectionStorage>({
    selectedConnectionId: { deserialize: Deserializers.string },
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
