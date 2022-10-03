import type { Duplex } from 'readable-stream'

import { NekotonRpcError } from '@app/models'
import {
    getUniqueId, JsonRpcError, JsonRpcNotification, SafeEventEmitter,
} from '@app/shared'

type Controller = { getApi: () => any, getState: () => any };
type ApiHandlers<T extends Controller> = ReturnType<T['getApi']>;

export type ApiMethodName<T> = keyof T;
export type ApiMethodParam<T> = T extends Error ? JsonRpcError : T;
export type ApiMethod<T, P extends ApiMethodName<T>> = T[P] extends (
    ...args: [...infer T, (error: Error | null, result?: infer U) => void]
) => void ? (...args: [...ApiMethodParam<T>]) => Promise<U> : never;

export type ControllerState<T extends Controller> = ReturnType<T['getState']>;

type ClientMethods = {
    onNotification(listener: NotificationListener): ListenerUnsubscriber
    close(): void
};

type ControllerRpcMethods<T> = {
    [P in ApiMethodName<T>]: ApiMethod<T, P>
};

export type IControllerRpcClient<T extends Controller> = {
    [K in keyof ClientMethods | keyof ControllerRpcMethods<ApiHandlers<T>>]: K extends keyof ClientMethods
        ? ClientMethods[K]
        : K extends keyof ControllerRpcMethods<ApiHandlers<T>>
            ? ControllerRpcMethods<ApiHandlers<T>>[K]
            : never
};

type RequestCallback = (error: Error | undefined, result?: unknown) => void;
export type NotificationListener = (data: JsonRpcNotification<unknown>) => void;
export type ListenerUnsubscriber = () => void;

class ControllerRpcClient<T extends Duplex> {

    connectionStream: T

    notificationChannel: SafeEventEmitter = new SafeEventEmitter()

    requests: Map<number, RequestCallback> = new Map<number, RequestCallback>()

    constructor(connectionStream: T) {
        this.connectionStream = connectionStream
        this.connectionStream.on('data', this._handleResponse.bind(this))
    }

    public onNotification(listener: NotificationListener): ListenerUnsubscriber {
        this.notificationChannel.addListener('notification', listener)

        return () => {
            this.notificationChannel.removeListener('notification', listener)
        }
    }

    public close() {
        this.notificationChannel.removeAllListeners()
    }

    private _handleResponse(data: {
        id?: number
        result?: unknown
        error?: JsonRpcError
        method?: string
        params?: unknown[]
    }) {
        const { id, result, error, method, params } = data
        const callback = id ? this.requests.get(id) : undefined

        if (method && params && id) {
            // don't handle server-side to client-side requests
            return
        }
        if (method && params && !id) {
            // handle server-side to client-side notification
            this.notificationChannel.emit('notification', data)
            return
        }
        if (!callback) {
            // not found in request list
            return
        }

        if (error) {
            const e = new NekotonRpcError(error.code, error.message, error.data)

            if (id) {
                this.requests.delete(id)
            }

            callback(e)
            return
        }

        if (id) {
            this.requests.delete(id)
        }

        callback(undefined, result)
    }

}

export const makeControllerRpcClient = <C extends Controller>(
    connectionStream: Duplex,
): IControllerRpcClient<C> => {
    const metaRPCClient = new ControllerRpcClient(connectionStream)
    return (new Proxy(metaRPCClient, {
        get: <T extends Duplex>(
            object: ControllerRpcClient<T>,
            property: keyof ControllerRpcClient<T>,
        ) => {
            if (object[property]) {
                return object[property]
            }

            return (...args: unknown[]) => new Promise<unknown>((resolve, reject) => {
                const id = getUniqueId()

                object.requests.set(id, (error: Error | undefined, result?: unknown) => {
                    if (error != null) {
                        reject(error)
                    }
                    else {
                        resolve(result)
                    }
                })
                object.connectionStream.write({
                    jsonrpc: '2.0',
                    method: property,
                    params: args,
                    id,
                })
            })
        },
    }) as unknown) as IControllerRpcClient<C>
}
