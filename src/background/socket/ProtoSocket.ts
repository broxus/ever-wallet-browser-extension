import type * as nt from '@broxus/ever-wallet-wasm'

import type { Nekoton, ProtoSocketParams } from '@app/models'
import { FetchCache } from '@app/background/utils/FetchCache'

export class ProtoSocket {

    constructor(
        private readonly nekoton: Nekoton,
        private readonly cache: FetchCache,
        private readonly origin?: string,
    ) {
    }

    public async connect(params: ProtoSocketParams): Promise<nt.ProtoConnection> {
        return new this.nekoton.ProtoConnection(new ProtoSender(params, this.cache, this.origin))
    }

}

class ProtoSender implements nt.IProtoSender {

    private endpoint: string | undefined

    constructor(
        private readonly params: ProtoSocketParams,
        private readonly cache: FetchCache,
        private readonly origin?: string,
    ) {
    }

    send(data: Uint8Array, handler: nt.BytesQuery) {
        (async () => {
            try {
                const body = Uint8Array.from(data) // unlink original Uint8Array from its ArrayBuffer
                const endpoint = this.endpoint ?? this.params.endpoint
                const key = this.cache.getKey({
                    url: endpoint,
                    method: 'post',
                    body,
                })
                const cachedValue = await this.cache.get(key)

                if (cachedValue) {
                    try {
                        const numbers = cachedValue.split(',').map(Number)
                        handler.onReceive(new Uint8Array(numbers))
                        return
                    }
                    catch {}
                }

                const response = await fetch(endpoint, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-protobuf',
                        'X-Version': process.env.EXT_VERSION ?? '',
                        'X-Origin': this.origin ?? 'extension',
                    },
                    body,
                })
                const arrayBuffer = await response.arrayBuffer()
                const uint8Array = new Uint8Array(arrayBuffer)

                if (response.ok) {
                    const ttl = this.cache.getTtlFromHeaders(response.headers)

                    if (ttl) {
                        await this.cache.set(key, uint8Array.toString(), { ttl })
                    }
                }

                if (response.ok && response.redirected) {
                    this.endpoint = response.url
                }

                handler.onReceive(uint8Array)
            }
            catch (e: any) {
                handler.onError(e)
            }
        })()
    }

}
