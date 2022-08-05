import { EventEmitter } from 'events'
import type { ProviderEvent, RawProviderEventData } from 'everscale-inpage-provider'
import { ProviderEvents } from 'everscale-inpage-provider/dist/api'
import debounce from 'lodash.debounce'
import { nanoid } from 'nanoid'
import type { ClockWithOffset } from 'nekoton-wasm'
import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import { Duplex } from 'readable-stream'

import { StandaloneNekoton } from '@app/models'
import {
    createEngineStream,
    createMetaRPCHandler,
    DomainMetadata,
    JsonRpcClient,
    JsonRpcEngine,
    JsonRpcMiddleware,
    nodeify,
    STANDALONE_CONTROLLER,
    STANDALONE_PROVIDER,
} from '@app/shared'

import { createStandaloneProviderMiddleware } from '../middleware/standaloneProviderMiddleware'
import { ApprovalController } from './ApprovalController'
import { ConnectionController } from './ConnectionController'
import { DomainMetadataController } from './DomainMetadataController'
import { PermissionsController } from './PermissionsController'
import { StandaloneSubscriptionController } from './StandaloneSubscriptionController'

export interface StandaloneControllerOptions {
    origin: string;
    nekoton: StandaloneNekoton,
    jrpcClient: JsonRpcClient,
    getDomainMetadata: () => Promise<DomainMetadata>
}

interface NekotonControllerComponents {
    counters: Counters;
    nekoton: StandaloneNekoton;
    jrpcClient: JsonRpcClient;
    clock: ClockWithOffset;
    approvalController: ApprovalController;
    permissionsController: PermissionsController;
    connectionController: ConnectionController;
    domainMetadataController: DomainMetadataController;
    subscriptionsController: StandaloneSubscriptionController;
}

interface SetupProviderEngineOptions {
    origin: string;
}

class Counters {

    activeControllerConnections: number = 0

    reservedControllerConnections: number = 0

    get totalControllerConnections() {
        return this.activeControllerConnections + this.reservedControllerConnections
    }

}

export class StandaloneController extends EventEmitter {

    private readonly _connections: { [id: string]: { engine: JsonRpcEngine } } = {}

    private readonly _options: StandaloneControllerOptions

    private readonly _components: NekotonControllerComponents

    public static async load(options: StandaloneControllerOptions): Promise<StandaloneController> {
        const { nekoton, origin, jrpcClient, getDomainMetadata } = options

        const counters = new Counters()
        const clock = new nekoton.ClockWithOffset()

        const connectionController = new ConnectionController({
            clock,
            nekoton: nekoton as any,
        })

        const approvalController = new ApprovalController({
            showApprovalRequest: () => jrpcClient.request('showApprovalRequest'),
            reserveControllerConnection: () => {
                counters.reservedControllerConnections += 1
            },
        })
        const permissionsController = new PermissionsController({ origin, approvalController })
        const domainMetadataController = new DomainMetadataController({ origin, getDomainMetadata })
        const subscriptionsController = new StandaloneSubscriptionController({
            clock,
            connectionController,
        })

        await connectionController.initialSync()
        await permissionsController.initialSync()
        await domainMetadataController.initialSync()

        return new StandaloneController(options, {
            jrpcClient,
            nekoton,
            counters,
            clock,
            approvalController,
            permissionsController,
            connectionController,
            domainMetadataController,
            subscriptionsController,
        })
    }

    private constructor(
        options: StandaloneControllerOptions,
        components: NekotonControllerComponents,
    ) {
        super()
        this._options = options
        this._components = components

        this._components.approvalController.subscribe(_state => {
            this._debouncedSendUpdate()
        })

        this._components.subscriptionsController.config.notifyTab = this._notifyTab.bind(this)
        this._components.permissionsController.config.notifyDomain = this._notifyConnections.bind(this)

        this.on('controllerConnectionChanged', (activeControllerConnections: number) => {
            if (activeControllerConnections === 0) {
                this._components.approvalController.clear()
            }
        })

        this._components.jrpcClient.onNotification(async data => {
            if (data.method === 'loggedOut') {
                await this._logOut()
            }
            else if (data.method === 'networkChanged') {
                const params = data.params as ProviderEvents['networkChanged']
                await this._changeNetwork(params.networkId)
            }
            else {
                this._notifyTab(data as any)
            }
        })
    }

    public setupTrustedCommunication<T extends Duplex>(connectionStream: T) {
        const mux = setupMultiplex(connectionStream)
        this._setupControllerConnection(mux.createStream(STANDALONE_CONTROLLER))
    }

    public setupUntrustedCommunication<T extends Duplex>(connectionStream: T) {
        const mux = setupMultiplex(connectionStream)
        this._setupProviderConnection(mux.createStream(STANDALONE_PROVIDER))
    }

    public getApi() {
        type ApiCallback<T> = (error: Error | null, result?: T) => void;

        const { approvalController } = this._components

        return {
            getState: (cb: ApiCallback<ReturnType<typeof StandaloneController.prototype.getState>>) => {
                cb(null, this.getState())
            },
            resolvePendingApproval: nodeify(approvalController, 'resolve'),
            rejectPendingApproval: nodeify(approvalController, 'reject'),
        }
    }

    public getState() {
        return {
            ...this._components.approvalController.state,
            ...this._components.domainMetadataController.state,
        }
    }

    private async _logOut() {
        await this._components.subscriptionsController.stopSubscriptions()
        await this._components.approvalController.clear()
        await this._components.permissionsController.clear()

        this._notifyTab({
            method: 'loggedOut',
            params: {},
        })
    }

    private async _changeNetwork(networkId: number) {
        const { connectionController, subscriptionsController } = this._components
        const currentNetwork = connectionController.state.selectedConnection
        const params = connectionController.getAvailableNetworks().find(item => item.networkId === networkId)

        if (currentNetwork.networkId === networkId || !params) return

        try {
            await subscriptionsController.unsubscribeFromAllContracts()
            await connectionController.trySwitchingNetwork(params, true)
        }
        catch (e: any) {
            await connectionController.trySwitchingNetwork(currentNetwork, true)
        }
        finally {
            const { selectedConnection } = this._components.connectionController.state

            this._notifyTab({
                method: 'networkChanged',
                params: {
                    networkId: selectedConnection.networkId,
                    selectedConnection: selectedConnection.group,
                },
            })

            this._sendUpdate()
        }
    }

    private _setupControllerConnection<T extends Duplex>(outStream: T) {
        const api = this.getApi()

        this._components.counters.activeControllerConnections += 1
        this.emit('controllerConnectionChanged', this._components.counters.totalControllerConnections)
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
            this.emit('controllerConnectionChanged', this._components.counters.totalControllerConnections)
            this.removeListener('update', handleUpdate)
        })
    }

    private _setupProviderConnection<T extends Duplex>(outStream: T) {
        const { origin } = this._options
        const engine = this._setupProviderEngine({ origin })
        const providerStream = createEngineStream({ engine })
        const connectionId = this._addConnection({ engine })

        pump(outStream, providerStream, outStream, e => {
            console.debug('providerStream closed')

            engine.destroy()

            this._components.subscriptionsController
                .unsubscribeFromAllContracts()
                .catch(console.error)

            if (connectionId) {
                this._removeConnection(connectionId)
            }

            if (e) {
                console.error(e)
            }
        })
    }

    private _setupProviderEngine({ origin }: SetupProviderEngineOptions) {
        const engine = new JsonRpcEngine()

        engine.push(createOriginMiddleware({ origin }))

        engine.push(
            createStandaloneProviderMiddleware({
                origin,
                jrpcClient: this._components.jrpcClient,
                nekoton: this._components.nekoton,
                clock: this._components.clock,
                approvalController: this._components.approvalController,
                connectionController: this._components.connectionController,
                permissionsController: this._components.permissionsController,
                subscriptionsController: this._components.subscriptionsController,
            }),
        )

        return engine
    }

    private _addConnection({ engine }: AddConnectionOptions) {
        const id = nanoid()
        this._connections[id] = { engine }

        return id
    }

    private _removeConnection(id: string) {
        delete this._connections[id]
    }

    private _notifyTab<T extends ProviderEvent>(payload: { method: T; params: RawProviderEventData<T> }) {
        for (const connection of Object.values(this._connections)) {
            connection.engine.emit('notification', payload)
        }
    }

    private _notifyConnections<T extends ProviderEvent>(
        origin: string,
        payload: { method: T; params: RawProviderEventData<T> },
    ) {
        if (this._options.origin !== origin) return

        this._notifyTab(payload)
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

const setupMultiplex = <T extends Duplex>(connectionStream: T) => {
    const mux = new ObjectMultiplex()
    pump(connectionStream, mux, connectionStream, e => {
        if (e) {
            console.error(e)
        }
    })
    return mux
}
