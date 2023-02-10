import browser from 'webextension-polyfill'

export class Storage<S extends {} = any> {

    private static configs: Record<string, StorageKeyConfig<any>> = {
        version: { deserialize: (value: any) => value ?? '0.3.16', exportable: true },
    }

    public static register<T>(configs: StorageConfig<T>): void {
        for (const [key, config] of Object.entries(configs)) {
            if (Storage.configs[key]) {
                console.warn(`[Storage] config already declared (${key})`, Storage.configs[key])
            }

            Storage.configs[key] = config as StorageConfig<T>
        }
    }

    private _snapshot: Partial<S> = {}

    get snapshot(): Partial<S> {
        return this._snapshot
    }

    async load(): Promise<void> {
        const version = process.env.EXT_VERSION ?? ''
        const keys = Object.keys(Storage.configs)
        const snapshot = this.deserialize(
            await browser.storage.local.get(keys),
        )

        if (snapshot.version !== version) {
            // TODO: storage upgrade, cleanup, etc.
            await browser.storage.local.set({ version })
        }

        this._snapshot = snapshot as Partial<S>
    }

    async get<K extends keyof S & string>(key: K): Promise<S[K] | undefined>;
    async get<K extends keyof S & string>(keys: K[]): Promise<{ [key in K]: S[key] | undefined }>;
    async get<K extends keyof S & string>(keyOrKeys: K[] | K): Promise<any> {
        let record: Record<string, any> = {}

        try {
            record = this.deserialize(
                await browser.storage.local.get(keyOrKeys),
            )
        }
        catch (e) {
            console.error(e)
        }

        return Array.isArray(keyOrKeys) ? record : record[keyOrKeys]
    }

    async set(items: Partial<S>): Promise<void> {
        try {
            const record = { ...items } as any

            for (const [key, value] of Object.entries(record)) {
                const config = Storage.configs[key]

                if (config?.serialize) {
                    record[key] = config.serialize(value)
                }
            }

            await browser.storage.local.set(record)
        }
        catch (e) {
            console.error(e)
        }
    }

    remove<K extends keyof S & string>(keys: K | K[]): Promise<void> {
        return browser.storage.local.remove(keys)
    }

    async import(data: string): Promise<void> {
        const parsedData = JSON.parse(data)
        const result: any = {}

        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('Invalid imported data format')
        }

        for (const [key, config] of Object.entries(Storage.configs)) {
            if (!config.exportable) continue

            if (config.validate?.(parsedData[key]) === false) {
                throw new Error(`Invalid imported data value (${key}: ${JSON.stringify(parsedData[key])})`)
            }

            result[key] = parsedData[key]
        }

        await browser.storage.local.clear()
        await browser.storage.local.set(result)
    }

    async export(): Promise<string> {
        const keys = Object.entries(Storage.configs)
            .filter(([, { exportable }]) => exportable)
            .map(([key]) => key)
        const result = await browser.storage.local.get(keys)

        return JSON.stringify(result, undefined, 2)
    }

    private deserialize(record: Record<string, any>): Record<string, any> {
        const result = { ...record }

        for (const [key, value] of Object.entries(result)) {
            const config = Storage.configs[key]

            if (config?.deserialize) {
                result[key] = config.deserialize(value)
            }
        }

        return result
    }

}

export class Deserializers {

    static string(value: any): string | undefined {
        if (typeof value !== 'string') return undefined
        return value
    }

    static number(value: any): number | undefined {
        if (typeof value !== 'number' || Number.isNaN(value)) return undefined
        return value
    }

    static object<T extends {}>(value: any): T | undefined {
        if (typeof value !== 'object' || !value) return undefined
        return value as T
    }

    static array<T extends any[]>(value: any): T | undefined {
        if (!Array.isArray(value)) return undefined
        return value as T
    }

}

export interface StorageKeyConfig<T> {
    readonly exportable?: boolean;
    serialize?(value: T): any; // data -> store
    deserialize?(value: any): T | undefined; // store -> data
    validate?(value: unknown): boolean; // validate value on import
}

export type StorageConfig<T> = { [K in keyof T]: StorageKeyConfig<T[K]> }
