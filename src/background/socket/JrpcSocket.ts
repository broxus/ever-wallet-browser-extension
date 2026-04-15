import type * as nt from '@broxus/ever-wallet-wasm'

import type { JrpcSocketParams, Nekoton } from '@app/models'

import type { FetchCache, FetchResult } from '../utils/FetchCache'

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

/**
 * Per-method stale time (ms). Methods not listed here are treated as mutations
 * (no caching, no deduplication). A value of 0 means deduplicate in-flight
 * requests but do not persist the result.
 */
const METHOD_STALE_TIME: Record<string, number> = {
    // contract state — deduped + short cache so sequential fee estimations reuse one call
    getContractState: 5_000,
    getFullContractState: 5_000,
    // transactions are immutable once confirmed
    getTransaction: 120_000,
    getDstTransaction: 120_000,
    getTransactions: 5_000,
    // slow-changing data
    getAccountsByCodeHash: 10_000,
    findExistingWallets: 30_000,
    getNetworkDescription: 3_600_000,
    getTokenRootDetails: 60_000,
    getJettonRootDetails: 60_000,
    getFeeFactors: 60_000,
    getBlockchainConfig: 60_000,
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
                const method = JrpcSender._parseMethod(data)
                const staleTime = method !== undefined ? METHOD_STALE_TIME[method] : undefined

                // Mutations bypass caching and deduplication entirely
                if (staleTime === undefined) {
                    handler.onReceive((await this._fetch(endpoint, data)).value)
                    return
                }

                const key = this.cache.getKey({ url: endpoint, method: 'post', body: data })
                handler.onReceive(await this.cache.dedupe(key, () => this._fetch(endpoint, data), staleTime))
            }
            catch (e: any) {
                handler.onError(e)
            }
        })()
    }

    private async _fetch(endpoint: string, data: string): Promise<FetchResult> {
        const response = await fetch(endpoint, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'X-Version': process.env.EXT_VERSION ?? '',
                'X-Origin': this.origin ?? 'extension',
            },
            body: data,
        })
        const value = await response.text()

        if (response.ok && response.redirected) {
            this.endpoint = response.url
        }

        return {
            value,
            headerTtl: response.ok ? this.cache.getTtlFromHeaders(response.headers) : 0,
        }
    }

    private static _parseMethod(data: string): string | undefined {
        try {
            return (JSON.parse(data) as { method?: string }).method
        }
        catch {
            return undefined
        }
    }

}
