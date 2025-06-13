import { Duplex } from 'readable-stream'
import log from 'loglevel'

import { IBridgeApi, IBridgeResponse } from '@app/models'
import { JsonRpcClient } from '@app/shared'

import { waitUntil } from '../utils/utils'

export class LedgerRpcClient {

    private streams: Duplex[] = []

    private jrpc: JsonRpcClient | undefined

    addStream(stream: Duplex) {
        this.streams.unshift(stream)
    }

    async sendMessage<T extends keyof IBridgeApi>(action: T, params: IBridgeApi[T]['input']): Promise<IBridgeResponse<T>> {
        if (!this.jrpc || this.jrpc.stream.destroyed) {
            this.jrpc = await this.setupConnection()
        }

        const promise = this.jrpc.request<IBridgeApi[T]['input'], IBridgeResponse<T>>(action, params)
        const response = await waitUntil(promise)

        if (response.error) {
            response.error = new Error(response.error.message)
        }

        return response
    }

    private async setupConnection(): Promise<JsonRpcClient> {
        while (this.streams.length) {
            const stream = this.streams.pop()!

            if (stream.destroyed) continue

            try {
                const jrpc = new JsonRpcClient(stream)
                await jrpc.request('initialize')
                return jrpc
            }
            catch (e) {
                log.error(e)
            }
        }

        throw Error('[LedgerRpcClient] unable to setup connection')
    }

}
