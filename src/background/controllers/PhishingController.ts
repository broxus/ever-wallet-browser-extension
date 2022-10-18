import { toASCII } from 'punycode'

import { BROXUS_BLACKLIST_URL } from '@app/shared'

import { BaseController, BaseConfig, BaseState } from './BaseController'
import { PhishingDetector, PhishingDetectorConfig, PhishingDetectResult } from '../utils/PhishingDetector'

export interface PhishingConfig extends BaseConfig {
    refreshInterval: number;
}

export interface PhishingState extends BaseState {
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

    public async initialSync() {
        const state = await this._loadState()
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
            blocklist = await this.queryConfig<string[]>(BROXUS_BLACKLIST_URL)
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

    private async _loadState(): Promise<PhishingState> {
        const defaultState = makeDefaultState()
        const { phishingConfigs, phishingWhitelist, phishingLastFetched } = await chrome.storage.local.get([
            'phishingConfigs',
            'phishingWhitelist',
            'phishingLastFetched',
        ])

        return {
            configs: phishingConfigs ?? defaultState.configs,
            whitelist: phishingWhitelist ?? defaultState.whitelist,
            lastFetched: phishingLastFetched ?? defaultState.lastFetched,
        }
    }

    private async _saveWhitelist(): Promise<void> {
        await chrome.storage.local.set({
            phishingWhitelist: this.state.whitelist,
        })
    }

    private async _saveConfig(): Promise<void> {
        await chrome.storage.local.set({
            phishingConfigs: this.state.configs,
            phishingLastFetched: this.state.lastFetched,
        })
    }

}
