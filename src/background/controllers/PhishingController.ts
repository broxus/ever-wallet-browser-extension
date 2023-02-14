import { toASCII } from 'punycode'

import { BROXUS_BLOCKLIST_URL } from '@app/shared'

import { Deserializers, Storage } from '../utils/Storage'
import { BaseConfig, BaseController, BaseState } from './BaseController'
import { PhishingDetector, PhishingDetectorConfig, PhishingDetectResult } from '../utils/PhishingDetector'

interface PhishingConfig extends BaseConfig {
    refreshInterval: number;
    storage: Storage<PhishingStorage>;
}

interface PhishingState extends BaseState {
    configs: PhishingDetectorConfig[];
    whitelist: string[];
    lastFetched: number;
}

function makeDefaultState(): PhishingState {
    return {
        configs: [{
            name: 'default',
            version: 0,
            allowlist: [],
            blocklist: [],
            fuzzylist: [],
            tolerance: 0,
        }],
        whitelist: [],
        lastFetched: 0,
    }
}

export class PhishingController extends BaseController<PhishingConfig, PhishingState> {

    private _detector!: PhishingDetector

    #inProgressUpdate: Promise<void> | undefined

    constructor(config: PhishingConfig, state?: PhishingState) {
        super(config, state)

        this.initialize()
    }

    public initialSync(): void {
        const { storage } = this.config
        const defaultState = makeDefaultState()
        const state = {
            configs: storage.snapshot.phishingConfigs ?? defaultState.configs,
            whitelist: storage.snapshot.phishingWhitelist ?? defaultState.whitelist,
            lastFetched: storage.snapshot.phishingLastFetched ?? defaultState.lastFetched,
        }

        this._detector = new PhishingDetector(state.configs)

        this.update(state)
    }

    public setRefreshInterval(interval: number) {
        this.configure({ refreshInterval: interval }, false, false)
    }

    public isOutOfDate() {
        return Date.now() - this.state.lastFetched >= this.config.refreshInterval
    }

    /**
     * Determines if a given origin is unapproved.
     */
    public test(origin: string): PhishingDetectResult {
        const punycodeOrigin = toASCII(origin)
        if (this.state.whitelist.indexOf(punycodeOrigin) !== -1) {
            return { result: false, type: 'all' }
        }
        return this._detector.check(punycodeOrigin)
    }

    /**
     * Temporarily marks a given origin as approved.
     */
    public async bypass(origin: string): Promise<void> {
        const punycodeOrigin = toASCII(origin)
        const { whitelist } = this.state

        if (whitelist.indexOf(punycodeOrigin) !== -1) {
            return
        }

        this.update({ whitelist: [...whitelist, punycodeOrigin] })
        await this._saveWhitelist()
    }

    public async updatePhishingLists() {
        if (this.#inProgressUpdate) {
            await this.#inProgressUpdate
            return
        }

        try {
            this.#inProgressUpdate = this.#updatePhishingLists()
            await this.#inProgressUpdate
        }
        finally {
            this.#inProgressUpdate = undefined
        }
    }

    async #updatePhishingLists() {
        if (this.disabled) {
            return
        }

        const configs: PhishingDetectorConfig[] = []
        let lastFetched: number,
            blocklist: string[] | null

        try {
            blocklist = await this.queryConfig<string[]>(BROXUS_BLOCKLIST_URL)
        }
        finally {
            // Set `lastFetched` even for failed requests to prevent server from being overwhelmed with
            // traffic after a network disruption.
            lastFetched = Date.now()
        }

        if (blocklist) {
            configs.push({
                blocklist,
                allowlist: [],
                fuzzylist: [],
                name: 'Broxus',
                version: 1,
                tolerance: 0,
            })
        }

        const update: Partial<PhishingState> = { lastFetched }

        if (configs.length) {
            this._detector = new PhishingDetector(configs)
            update.configs = configs
        }

        this.update(update)
        await this._saveConfig()
    }

    private async queryConfig<ResponseType>(
        input: RequestInfo,
    ): Promise<ResponseType | null> {
        try {
            const response = await fetch(input, { cache: 'no-cache' })

            if (response.status === 200) {
                return await response.json()
            }
        }
        catch (e) {
            console.error(e)
        }

        return null
    }

    private _saveWhitelist(): Promise<void> {
        return this.config.storage.set({
            phishingWhitelist: this.state.whitelist,
        })
    }

    private _saveConfig(): Promise<void> {
        return this.config.storage.set({
            phishingConfigs: this.state.configs,
            phishingLastFetched: this.state.lastFetched,
        })
    }

}

interface PhishingStorage {
    phishingConfigs: PhishingDetectorConfig[];
    phishingWhitelist: string[];
    phishingLastFetched: number;
}

Storage.register<PhishingStorage>({
    phishingConfigs: { deserialize: Deserializers.array },
    phishingWhitelist: { deserialize: Deserializers.array },
    phishingLastFetched: { deserialize: Deserializers.number },
})
