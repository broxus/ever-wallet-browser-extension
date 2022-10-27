import { hash } from 'object-code'
import { Mutex } from '@broxus/await-semaphore'

export interface CacheKeyParams {
    url: string;
    method: string;
    body: string;
}

export interface CacheOptions {
    ttl: number;
}

interface CacheItem {
    value: string;
    exp: number; // expire at
    cat: number; // created at
}

type Cache = Record<string, CacheItem>

const QUOTA_BYTES = Math.floor(chrome.storage.local.QUOTA_BYTES / 4)
const MAX_AGE_REGEXP = /max-age=(\d+)/i

export class FetchCache {

    private readonly encoder = new TextEncoder()

    private readonly mutex = new Mutex()

    getKey(params: CacheKeyParams): string {
        return hash(params).toString()
    }

    getTtlFromHeaders(headers: Headers): number {
        try {
            const header = headers.get('cache-control')

            if (header) {
                const match = header.match(MAX_AGE_REGEXP)

                if (match) {
                    const value = match[1]
                    return parseInt(value, 10) * 1000 // sec to ms
                }
            }
        }
        catch (e) {
            console.error(e)
        }

        return 0
    }

    async get(key: string): Promise<string | null> {
        try {
            const cache = await this.mutex.use(() => this.getCache())
            const item = cache[key]

            if (item && item.exp >= Date.now()) {
                return item.value
            }
        }
        catch (e) {
            console.error(e)
        }

        return null
    }

    async set(key: string, value: string, options: CacheOptions): Promise<void> {
        await this.mutex.use(async () => {
            try {
                const cache = await this.getCache()
                const valueBytes = this.encoder.encode(value).length

                if (valueBytes >= QUOTA_BYTES) {
                    return // skip cache if size is too big
                }

                const bytesInUse = await chrome.storage.local.getBytesInUse('fetchCache')

                if (bytesInUse + valueBytes >= QUOTA_BYTES) {
                    this.freeSpace(cache, bytesInUse + valueBytes - QUOTA_BYTES)
                }

                const now = Date.now()
                cache[key] = {
                    value,
                    cat: now,
                    exp: now + options.ttl,
                }

                await chrome.storage.local.set({ fetchCache: cache })
            }
            catch (e) {
                console.error(e)
            }
        })
    }

    private async getCache(): Promise<Cache> {
        return (await chrome.storage.local.get('fetchCache')).fetchCache ?? {}
    }

    private freeSpace(cache: Cache, bytes: number): void {
        const now = Date.now()
        let insufficientBytes = bytes

        // remove expired items
        for (const [key, item] of Object.entries(cache)) {
            if (item.exp < now) {
                insufficientBytes -= this.encoder.encode(item.value).length
                delete cache[key]
            }
        }

        if (insufficientBytes <= 0) return

        // LRU
        const entries = Object.entries(cache)
        entries.sort(([, a], [, b]) => a.cat - b.cat)

        for (const [key, item] of entries) {
            insufficientBytes -= this.encoder.encode(item.value).length
            delete cache[key]

            if (insufficientBytes <= 0) break
        }
    }

}
