import type * as nt from '@broxus/ever-wallet-wasm'

import type { JrpcSocketParams, Nekoton } from '@app/models'

import type { FetchCache } from '../utils/FetchCache'

export class JrpcSocket {

    constructor(
        private readonly nekoton: Nekoton,
        private readonly cache: FetchCache,
        private readonly origin?: string,
    ) {
    }

    public async connect(params: JrpcSocketParams): Promise<nt.JrpcConnection> {
        return new this.nekoton.JrpcConnection(new JrpcSender(params, this.cache, this.origin))
    }

}

class JrpcSender implements nt.IJrpcSender {

    private endpoint: string | undefined

    constructor(
        private readonly params: JrpcSocketParams,
        private readonly cache: FetchCache,
        private readonly origin?: string,
    ) {
    }

    send(data: string, handler: nt.StringQuery) {
        (async () => {
            try {
                const endpoint = this.endpoint ?? this.params.endpoint
                const key = this.cache.getKey({
                    url: endpoint,
                    method: 'post',
                    body: data,
                })
                const cachedValue = await this.cache.get(key)

                if (cachedValue) {
                    handler.onReceive(cachedValue)
                    return
                }

                const response = await fetch(endpoint, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Version': process.env.EXT_VERSION ?? '',
                        'X-Origin': this.origin ?? 'extension',
                    },
                    body: data,
                })
                const text = await response.text()

                if (response.ok) {
                    const ttl = this.cache.getTtlFromHeaders(response.headers)

                    if (ttl) {
                        await this.cache.set(key, text, { ttl })
                    }
                }

                if (response.ok && response.redirected) {
                    this.endpoint = response.url
                }

                handler.onReceive(text)
            }
            catch (e: any) {
                handler.onError(e)
            }
        })()
    }

}
