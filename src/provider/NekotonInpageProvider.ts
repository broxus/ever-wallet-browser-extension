import {
    ConsoleLike,
    Maybe,
} from '@app/shared/utils'
import { JsonRpcRequest, JsonRpcResponse } from '@app/shared/jrpc'

import { Client } from './Client'

export interface NekotonInpageProviderOptions {
    jsonRpcStreamName?: string;
    logger?: ConsoleLike;
    maxEventListeners?: number;
}

export interface RequestArguments {
    method: string;
    params?: unknown[] | Record<string, unknown>;
}

export class NekotonInpageProvider {

    constructor(
        private client: Client,
    ) {
    }

    public async request<T>(args: RequestArguments): Promise<Maybe<T>> {
        return this.client.request(args)
    }

    public sendAsync(
        payload: JsonRpcRequest<unknown>,
        callback: (error: Error | null, response?: JsonRpcResponse<unknown>) => void,
    ) {
        this.client.rpcRequest(payload, callback)
    }

    public addListener(eventName: string, listener: (...args: unknown[]) => void) {
        return this.client.addListener(eventName, listener)
    }

    public removeListener(eventName: string, listener: (...args: unknown[]) => void) {
        return this.client.removeListener(eventName, listener)
    }

    public on(eventName: string, listener: (...args: unknown[]) => void) {
        return this.client.on(eventName, listener)
    }

    public once(eventName: string, listener: (...args: unknown[]) => void) {
        return this.client.once(eventName, listener)
    }

    public prependListener(eventName: string, listener: (...args: unknown[]) => void) {
        return this.client.prependListener(eventName, listener)
    }

    public prependOnceListener(eventName: string, listener: (...args: unknown[]) => void) {
        return this.client.prependOnceListener(eventName, listener)
    }

}
