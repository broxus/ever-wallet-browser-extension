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

export abstract class FetchCache {

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

    abstract get(key: string): Promise<string | null>

    abstract set(key: string, value: string, options: CacheOptions): Promise<void>

}

export class StorageFetchCache extends FetchCache {

    private readonly mutex = new Mutex()

    async get(key: string): Promise<string | null> {
        try {
            const cache = await this.getCache()
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
        if (options.ttl <= 3000) return // skip short ttl for perfomance

        await this.mutex.use(async () => {
            try {
                const cache = await this.getCache()
                const valueBytes = value.length

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
                insufficientBytes -= item.value.length
                delete cache[key]
            }
        }

        if (insufficientBytes <= 0) return

        // LRU
        const entries = Object.entries(cache)
        entries.sort(([, a], [, b]) => a.cat - b.cat)

        for (const [key, item] of entries) {
            insufficientBytes -= item.value.length
            delete cache[key]

            if (insufficientBytes <= 0) break
        }
    }

}

const QUOTA_SIZE = 2000

export class MemoryFetchCache extends FetchCache {

    private readonly cache: Cache = {}

    private readonly keys = new Set<string>()

    async get(key: string): Promise<string | null> {
        try {
            const item = this.cache[key]

            if (item) {
                if (item.exp >= Date.now()) {
                    return item.value
                }

                delete this.cache[key]
                this.keys.delete(key)
            }
        }
        catch (e) {
            console.error(e)
        }

        return null
    }

    async set(key: string, value: string, options: CacheOptions): Promise<void> {
        try {
            const now = Date.now()
            this.cache[key] = {
                value,
                cat: now,
                exp: now + options.ttl,
            }
            this.keys.add(key)

            if (this.keys.size >= QUOTA_SIZE) {
                this.freeSpace()
            }
        }
        catch (e) {
            console.error(e)
        }
    }

    private freeSpace(): void {
        const now = Date.now()

        // remove expired items
        for (const [key, item] of Object.entries(this.cache)) {
            if (item.exp < now) {
                delete this.cache[key]
                this.keys.delete(key)
            }
        }

        // remove at least QUOTA_SIZE / 4 elements
        if (this.keys.size <= (QUOTA_SIZE / 4) * 3) return

        // LRU
        for (const key of this.keys.keys()) { // in insertion order
            if (this.keys.size <= (QUOTA_SIZE / 4) * 3) break
            delete this.cache[key]
            this.keys.delete(key)
        }
    }

}
