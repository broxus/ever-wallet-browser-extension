import log from 'loglevel'

export interface SseUpdate {
    address: string
    maxLt: number
    genUtime: number
    dropped?: number
}

export interface SubscribeCallbacks {
    onUpdate: (update: SseUpdate) => void
    onConnectionLost?: () => void
    onConnectionRestored?: () => void
}

export interface SseSubscriptionOptions {
    baseUrl: string
    idleTimeoutMs?: number
    maxAddrsPerConnection?: number
}

type ListenerId = number
type ConnectionId = number
type TimeoutHandle = ReturnType<typeof setTimeout>

interface AddressState {
    listeners: Map<ListenerId, SubscribeCallbacks>
    lastUpdate?: SseUpdate
    idleTimer?: TimeoutHandle
    connectionId?: ConnectionId
    fallbackActive: boolean
}

interface ConnectionHooks {
    streamUrl: string
    maxAddrs: number
    rpcCall: <T>(method: string, params: unknown) => Promise<T>
    onUpdate: (update: SseUpdate) => void
    onConnectionLost: (connectionId: ConnectionId) => void
    onConnectionRestored: (connectionId: ConnectionId) => void
    onSubscriptionFailed: (connectionId: ConnectionId, address: string) => void
    backoffDelay: (attempt: number) => number
}

const DEFAULT_IDLE_TIMEOUT_MS = 30000
const DEFAULT_MAX_ADDRS_PER_CONNECTION = 255
const DEFAULT_MIN_RECONNECT_DELAY_MS = 500
const DEFAULT_MAX_RECONNECT_DELAY_MS = 30000
const DEFAULT_BACKOFF_FACTOR = 2
const DEFAULT_BACKOFF_JITTER = 0.2

class SseConnection {

    readonly id: ConnectionId

    readonly addresses = new Set<string>()

    private readonly hooks: ConnectionHooks

    private eventSource?: EventSource

    private uuid?: string

    private reconnectAttempt = 0

    private reconnectTimer?: ReturnType<typeof setTimeout>

    private closedByUser = false

    private isConnected = false

    constructor(id: ConnectionId, hooks: ConnectionHooks) {
        this.id = id
        this.hooks = hooks
    }

    hasCapacity(): boolean {
        return this.addresses.size < this.hooks.maxAddrs
    }

    connect(): void {
        if (this.closedByUser) {
            return
        }

        if (typeof EventSource === 'undefined') {
            log.error('EventSource is not available in this environment')
            return
        }

        this.closeEventSource()

        const es = new EventSource(this.hooks.streamUrl)
        this.eventSource = es

        es.addEventListener('uuid', (event) => {
            const hadPreviousConnection = this.uuid !== undefined
            const uuid = event.data
            this.uuid = uuid
            this.reconnectAttempt = 0
            this.isConnected = true

            log.trace(`SSE connection ${this.id} received UUID: ${uuid}`)

            // Resubscribe to all addresses after reconnection
            this.resubscribeAll().catch((err) => {
                log.error('Failed to resubscribe after reconnect', err)
            })

            // Notify about connection restoration (only if it was a reconnect, not initial connect)
            if (hadPreviousConnection && this.addresses.size > 0) {
                this.hooks.onConnectionRestored(this.id)
            }
        })

        es.addEventListener('update', (event) => {
            try {
                const parsed = JSON.parse(event.data) as {
                    address: string
                    maxLt: number
                    genUtime: number
                    dropped?: number
                }

                const update: SseUpdate = {
                    address: parsed.address,
                    maxLt: parsed.maxLt,
                    genUtime: parsed.genUtime,
                    dropped: parsed.dropped,
                }

                this.hooks.onUpdate(update)
            }
            catch (err) {
                log.warn('Failed to parse SSE update event', err)
            }
        })

        es.addEventListener('keep-alive', () => {
            log.trace(`SSE connection ${this.id} keep-alive`)
        })

        es.addEventListener('error', () => {
            const wasConnected = this.isConnected
            this.isConnected = false

            log.error(`SSE connection ${this.id} error`)
            this.closeEventSource()

            if (this.closedByUser) {
                return
            }

            // Notify about connection loss
            if (wasConnected) {
                this.hooks.onConnectionLost(this.id)
            }

            const delay = this.hooks.backoffDelay(this.reconnectAttempt)
            this.reconnectAttempt += 1

            log.trace(`SSE connection ${this.id} will reconnect in ${delay}ms (attempt ${this.reconnectAttempt})`)
            this.reconnectTimer = setTimeout(() => this.connect(), delay)
        })
    }

    close(): void {
        this.closedByUser = true
        this.closeEventSource()

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = undefined
        }

        if (this.uuid) {
            this.hooks
                .rpcCall('subUnsubscribeAll', { uuid: this.uuid })
                .catch((err) => {
                    log.warn('Failed to unsubscribe all before close', err)
                })
        }
    }

    addAddress(address: string): void {
        if (this.addresses.has(address)) {
            return
        }

        if (!this.hasCapacity()) {
            throw new Error('Connection at capacity')
        }

        this.addresses.add(address)

        if (this.uuid) {
            this.hooks
                .rpcCall('subSubscribe', { uuid: this.uuid, addrs: [address] })
                .catch((err) => {
                    this.addresses.delete(address)
                    this.hooks.onSubscriptionFailed(this.id, address)
                    log.error(`Failed to subscribe to address ${address}`, err)
                })
        }
    }

    removeAddress(address: string): void {
        if (!this.addresses.has(address)) {
            return
        }

        this.addresses.delete(address)

        if (this.uuid) {
            this.hooks
                .rpcCall('subUnsubscribe', { uuid: this.uuid, addrs: [address] })
                .catch((err) => {
                    this.addresses.add(address)
                    log.warn(`Failed to unsubscribe from address ${address}`, err)
                })
        }
    }

    private async resubscribeAll(): Promise<void> {
        if (!this.uuid || this.addresses.size === 0) {
            return
        }

        await this.hooks.rpcCall('subSubscribe', {
            uuid: this.uuid,
            addrs: Array.from(this.addresses),
        })
    }

    private closeEventSource(): void {
        if (!this.eventSource) {
            return
        }

        this.eventSource.close()
        this.eventSource = undefined
    }

}

export class SseSubscriptionService {

    private readonly rpcUrl: string

    private readonly streamUrl: string

    private readonly idleTimeoutMs: number

    private readonly maxAddrsPerConnection: number

    private readonly minReconnectDelayMs: number

    private readonly maxReconnectDelayMs: number

    private readonly backoffFactor: number

    private readonly backoffJitter: number

    private readonly connections = new Map<ConnectionId, SseConnection>()

    private readonly addressStates = new Map<string, AddressState>()

    private nextListenerId = 1

    private nextConnectionId = 1

    private rpcId = 1

    constructor(options: SseSubscriptionOptions) {
        const baseUrl = options.baseUrl.replace(/\/+$/, '')
        this.rpcUrl = `${baseUrl}/rpc`
        this.streamUrl = `${baseUrl}/stream`
        this.idleTimeoutMs = options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS
        this.maxAddrsPerConnection = options.maxAddrsPerConnection ?? DEFAULT_MAX_ADDRS_PER_CONNECTION
        this.minReconnectDelayMs = DEFAULT_MIN_RECONNECT_DELAY_MS
        this.maxReconnectDelayMs = DEFAULT_MAX_RECONNECT_DELAY_MS
        this.backoffFactor = DEFAULT_BACKOFF_FACTOR
        this.backoffJitter = DEFAULT_BACKOFF_JITTER
    }

    /**
     * Subscribe to address updates
     * @returns unsubscribe function
     */
    subscribe(address: string, callbacksOrOnUpdate: SubscribeCallbacks | ((update: SseUpdate) => void)): () => void {
        // Normalize callbacks for backward compatibility
        const callbacks: SubscribeCallbacks = typeof callbacksOrOnUpdate === 'function'
            ? { onUpdate: callbacksOrOnUpdate }
            : callbacksOrOnUpdate
        let state = this.addressStates.get(address)

        if (!state) {
            state = {
                listeners: new Map(),
                lastUpdate: undefined,
                idleTimer: undefined,
                connectionId: undefined,
                fallbackActive: false,
            }
            this.addressStates.set(address, state)
        }

        // Cancel idle timer if exists
        if (state.idleTimer !== undefined) {
            clearTimeout(state.idleTimer)
            state.idleTimer = undefined
        }

        const listenerId = this.nextListenerId as ListenerId
        this.nextListenerId += 1
        state.listeners.set(listenerId, callbacks)

        // Add address to connection
        if (state.connectionId === undefined) {
            const conn = this.getOrCreateConnection()
            state.connectionId = conn.id
            conn.addAddress(address)
        }
        else {
            const conn = this.connections.get(state.connectionId)
            if (!conn) {
                const next = this.getOrCreateConnection()
                state.connectionId = next.id
                next.addAddress(address)
            }
        }

        // Return unsubscribe function
        return () => this.unsubscribe(address, listenerId)
    }

    /**
     * Get subscription statistics
     */
    getStats(): { connections: number; addresses: number; listeners: number } {
        let listeners = 0
        for (const state of this.addressStates.values()) {
            listeners += state.listeners.size
        }
        return {
            connections: this.connections.size,
            addresses: this.addressStates.size,
            listeners,
        }
    }

    /**
     * Close all subscriptions and connections
     */
    closeAll(): void {
        for (const state of this.addressStates.values()) {
            if (state.idleTimer !== undefined) {
                clearTimeout(state.idleTimer)
            }
        }
        this.addressStates.clear()

        for (const conn of this.connections.values()) {
            conn.close()
        }
        this.connections.clear()
    }

    private unsubscribe(address: string, listenerId: ListenerId): void {
        const state = this.addressStates.get(address)
        if (!state) {
            return
        }

        state.listeners.delete(listenerId)

        // If there are still listeners, do nothing
        if (state.listeners.size > 0) {
            return
        }

        // Start idle timer
        const timer = setTimeout(() => {
            const latest = this.addressStates.get(address)
            if (!latest || latest.listeners.size > 0) {
                return
            }
            this.unsubscribeNow(address)
        }, this.idleTimeoutMs)

        state.idleTimer = timer
    }

    private unsubscribeNow(address: string): void {
        const state = this.addressStates.get(address)
        if (!state) {
            return
        }

        if (state.idleTimer !== undefined) {
            clearTimeout(state.idleTimer)
        }

        const conn = state.connectionId !== undefined
            ? this.connections.get(state.connectionId)
            : undefined

        state.connectionId = undefined
        this.addressStates.delete(address)

        if (!conn) {
            return
        }

        conn.removeAddress(address)

        // Close connection if no more addresses
        if (conn.addresses.size === 0) {
            this.closeConnection(conn.id)
        }
    }

    private getOrCreateConnection(): SseConnection {
        // Find existing connection with available capacity
        for (const conn of this.connections.values()) {
            if (conn.hasCapacity()) {
                return conn
            }
        }

        // Create new connection
        const id = this.nextConnectionId
        this.nextConnectionId += 1

        const conn = new SseConnection(id, {
            streamUrl: this.streamUrl,
            maxAddrs: this.maxAddrsPerConnection,
            rpcCall: this.rpcCall.bind(this),
            onUpdate: this.dispatchUpdate.bind(this),
            onConnectionLost: this.dispatchConnectionLost.bind(this),
            onConnectionRestored: this.dispatchConnectionRestored.bind(this),
            onSubscriptionFailed: this.handleSubscriptionFailed.bind(this),
            backoffDelay: this.backoffDelay.bind(this),
        })

        this.connections.set(id, conn)
        conn.connect()

        log.trace(`Created SSE connection ${id}`)

        return conn
    }

    private closeConnection(id: ConnectionId): void {
        const conn = this.connections.get(id)
        if (!conn) {
            return
        }

        log.trace(`Closing SSE connection ${id}`)
        conn.close()
        this.connections.delete(id)
    }

    private dispatchUpdate(update: SseUpdate): void {
        const state = this.addressStates.get(update.address)
        if (!state) {
            return
        }

        state.lastUpdate = update

        for (const listener of state.listeners.values()) {
            try {
                listener.onUpdate(update)
            }
            catch (err) {
                log.warn('Listener threw while handling update', err)
            }
        }
    }

    private dispatchConnectionLost(connectionId: ConnectionId): void {
        for (const [_, state] of this.addressStates.entries()) {
            if (state.connectionId === connectionId && !state.fallbackActive) {
                state.fallbackActive = true
                for (const listener of state.listeners.values()) {
                    try {
                        listener.onConnectionLost?.()
                    }
                    catch (err) {
                        log.warn('Listener threw while handling connection lost', err)
                    }
                }
            }
        }
    }

    private dispatchConnectionRestored(connectionId: ConnectionId): void {
        for (const [_, state] of this.addressStates.entries()) {
            if (state.connectionId === connectionId && state.fallbackActive) {
                state.fallbackActive = false
                for (const listener of state.listeners.values()) {
                    try {
                        listener.onConnectionRestored?.()
                    }
                    catch (err) {
                        log.warn('Listener threw while handling connection restored', err)
                    }
                }
            }
        }
    }

    private handleSubscriptionFailed(connectionId: ConnectionId, address: string): void {
        const state = this.addressStates.get(address)
        if (!state || state.connectionId !== connectionId) {
            return
        }

        log.warn(`Subscription failed for address ${address}, cleaning up state and starting fallback`)

        // Clear idle timer if exists
        if (state.idleTimer !== undefined) {
            clearTimeout(state.idleTimer)
            state.idleTimer = undefined
        }

        // Mark fallback as active and notify listeners to start polling
        state.fallbackActive = true
        state.connectionId = undefined

        for (const listener of state.listeners.values()) {
            try {
                listener.onConnectionLost?.()
            }
            catch (err) {
                log.warn('Listener threw while handling subscription failure', err)
            }
        }
    }

    private backoffDelay(attempt: number): number {
        const exp = Math.min(
            this.maxReconnectDelayMs,
            this.minReconnectDelayMs * this.backoffFactor ** attempt,
        )
        const jitter = exp * this.backoffJitter
        const offset = (Math.random() * 2 - 1) * jitter
        return Math.max(0, Math.round(exp + offset))
    }

    private async rpcCall<T>(method: string, params: unknown): Promise<T> {
        const id = this.rpcId
        this.rpcId += 1

        const res = await fetch(this.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id,
                method,
                params,
            }),
        })

        const payload = (await res.json()) as {
            result?: T
            error?: { code: number; message: string }
        }

        if (payload.error) {
            throw new Error(`${payload.error.code}: ${payload.error.message}`)
        }

        return payload.result as T
    }

}
