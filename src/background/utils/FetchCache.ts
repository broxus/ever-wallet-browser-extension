import { hash } from 'object-code';
import { Mutex } from '@broxus/await-semaphore';
import log from 'loglevel';
import browser from 'webextension-polyfill';

export interface CacheKeyParams {
    url: string;
    method: string;
    body: string | Uint8Array;
}

export interface CacheOptions {
    ttl: number;
}

interface CacheItem {
    value: string;
    exp: number; // expire at
    cat: number; // created at
}

type Cache = Record<string, CacheItem>;

const QUOTA_BYTES = Math.floor(browser.storage.local.QUOTA_BYTES / 4);
const MAX_AGE_REGEXP = /max-age=(\d+)/i;

export interface FetchResult {
    value: string;
    headerTtl: number;
}

export abstract class FetchCache {
    private readonly _inflight = new Map<string, Promise<string>>();

    getKey(params: CacheKeyParams): string {
        return hash(params).toString();
    }

    getTtlFromHeaders(headers: Headers): number {
        try {
            const header = headers.get('cache-control');

            if (header) {
                const match = header.match(MAX_AGE_REGEXP);

                if (match) {
                    const value = match[1];
                    return parseInt(value, 10) * 1000; // sec to ms
                }
            }
        } catch (e) {
            log.error(e);
        }

        return 0;
    }

    async dedupe(key: string, fetcher: () => Promise<FetchResult>, fallbackTtl: number): Promise<string> {
        // Fast path: join an already in-flight request (sync, no await)
        const earlyInflight = this._inflight.get(key);
        if (earlyInflight) return earlyInflight;

        const cached = await this.get(key);
        if (cached) return cached;

        // Re-check after the async gap — another caller may have started a fetch
        const inflight = this._inflight.get(key);
        if (inflight) return inflight;

        const pending = fetcher()
            .then(async ({ value, headerTtl }) => {
                const ttl = headerTtl > 0 ? headerTtl : fallbackTtl;
                if (ttl > 0) await this.set(key, value, { ttl });
                return value;
            })
            .finally(() => this._inflight.delete(key));
        this._inflight.set(key, pending);
        return pending;
    }

    abstract get(key: string): Promise<string | null>;

    abstract set(key: string, value: string, options: CacheOptions): Promise<void>;
}

// TODO: remove
export class StorageFetchCache extends FetchCache {
    private readonly mutex = new Mutex();

    async get(key: string): Promise<string | null> {
        try {
            const cache = await this.getCache();
            const item = cache[key];

            if (item && item.exp >= Date.now()) {
                return item.value;
            }
        } catch (e) {
            log.error(e);
        }

        return null;
    }

    async set(key: string, value: string, options: CacheOptions): Promise<void> {
        if (options.ttl <= 3000) return; // skip short ttl for perfomance

        await this.mutex.use(async () => {
            try {
                const cache = await this.getCache();
                const valueBytes = value.length;

                if (valueBytes >= QUOTA_BYTES) {
                    return; // skip cache if size is too big
                }

                const data = await browser.storage.local.get('fetchCache');
                const bytesInUse = new TextEncoder().encode(JSON.stringify(data)).length;

                if (bytesInUse + valueBytes >= QUOTA_BYTES) {
                    this.freeSpace(cache, bytesInUse + valueBytes - QUOTA_BYTES);
                }

                const now = Date.now();
                cache[key] = {
                    value,
                    cat: now,
                    exp: now + options.ttl,
                };

                await browser.storage.local.set({ fetchCache: cache });
            } catch (e) {
                log.error(e);
            }
        });
    }

    private async getCache(): Promise<Cache> {
        return (await browser.storage.local.get('fetchCache')).fetchCache ?? {};
    }

    private freeSpace(cache: Cache, bytes: number): void {
        const now = Date.now();
        let insufficientBytes = bytes;

        // remove expired items
        for (const [key, item] of Object.entries(cache)) {
            if (item.exp < now) {
                insufficientBytes -= item.value.length;
                delete cache[key];
            }
        }

        if (insufficientBytes <= 0) return;

        // LRU
        const entries = Object.entries(cache);
        entries.sort(([, a], [, b]) => a.cat - b.cat);

        for (const [key, item] of entries) {
            insufficientBytes -= item.value.length;
            delete cache[key];

            if (insufficientBytes <= 0) break;
        }
    }
}

const QUOTA_SIZE = 2000;

export class MemoryFetchCache extends FetchCache {
    private readonly cache: Cache = {};

    private readonly keys = new Set<string>();

    async get(key: string): Promise<string | null> {
        try {
            const item = this.cache[key];

            if (item) {
                if (item.exp >= Date.now()) {
                    return item.value;
                }

                delete this.cache[key];
                this.keys.delete(key);
            }
        } catch (e) {
            log.error(e);
        }

        return null;
    }

    async set(key: string, value: string, options: CacheOptions): Promise<void> {
        try {
            const now = Date.now();
            this.cache[key] = {
                value,
                cat: now,
                exp: now + options.ttl,
            };
            this.keys.add(key);

            if (this.keys.size >= QUOTA_SIZE) {
                this.freeSpace();
            }
        } catch (e) {
            log.error(e);
        }
    }

    private freeSpace(): void {
        const now = Date.now();

        // remove expired items
        for (const [key, item] of Object.entries(this.cache)) {
            if (item.exp < now) {
                delete this.cache[key];
                this.keys.delete(key);
            }
        }

        // remove at least QUOTA_SIZE / 4 elements
        if (this.keys.size <= (QUOTA_SIZE / 4) * 3) return;

        // LRU
        for (const key of this.keys.keys()) {
            // in insertion order
            if (this.keys.size <= (QUOTA_SIZE / 4) * 3) break;
            delete this.cache[key];
            this.keys.delete(key);
        }
    }
}
