import { EventEmitter } from 'events'
import debounce from 'lodash.debounce'
import log from 'loglevel'
import browser from 'webextension-polyfill'

export interface Port {
    readonly onMessage: SimpleEvent<(message: any) => void>;
    readonly onDisconnect: SimpleEvent<() => void>;

    postMessage(message: any): void;
}

interface SimpleEvent<T extends Function> {
    addListener(callback: T): void;

    removeListener(callback: T): void;
}

export interface PortFactory {
    (): browser.Runtime.Port;
}

export class ReconnectablePort implements Port {

    private disconnected = false

    private port: browser.Runtime.Port | undefined

    private emitter = new EventEmitter()

    private _reconnect = debounce(this.reconnect, 100, { trailing: true, leading: true })

    constructor(private factory: PortFactory, port?: browser.Runtime.Port) {
        this.port = port ?? factory()
        this.setupEvents(this.port)
    }

    get onDisconnect() {
        return {
            addListener: (callback: any) => this.emitter.on('disconnect', callback),
            removeListener: (callback: any) => this.emitter.off('disconnect', callback),
        }
    }

    get onMessage() {
        return {
            addListener: (callback: any) => this.emitter.on('message', callback),
            removeListener: (callback: any) => this.emitter.off('message', callback),
        }
    }

    postMessage(message: any): void {
        if (!this.port) {
            log.log(`[ReconnectablePort] unable to post message; disconnected: ${this.disconnected}`)
        }

        this.port?.postMessage(message)
    }

    private getPort(): browser.Runtime.Port | undefined {
        if (this.disconnected) return undefined

        let port: browser.Runtime.Port | undefined

        try {
            port = this.factory()
            this.setupEvents(port)
        }
        catch (e) {
            log.trace('[ReconnectablePort] port factory error', e)
            this.disconnect()
        }

        return port
    }

    private setupEvents(port: browser.Runtime.Port) {
        port.onMessage.addListener(message => this.emitter.emit('message', message))
        port.onDisconnect.addListener(() => this._reconnect())
    }

    private reconnect() {
        log.trace('[ReconnectablePort] reconnecting', browser.runtime.lastError)
        this.port = this.getPort()
    }

    private disconnect() {
        log.trace('[ReconnectablePort] disconnect')
        this.disconnected = true
        this.port = undefined
        this.emitter.emit('disconnect')
    }

}
