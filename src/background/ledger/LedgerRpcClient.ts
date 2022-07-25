import { Duplex } from 'readable-stream'

import { IBridgeApi, IBridgeResponse } from '@app/models'
import { JsonRpcClient } from '@app/shared'

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

        return this.jrpc.request<IBridgeApi[T]['input'], IBridgeResponse<T>>(action, params)
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
                console.error(e)
            }
        }

        throw Error('[LedgerRpcClient] unable to setup connection')
    }

}
