import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import type { NetworkConfig, NetworkGroup } from '@app/models'
import { FLATQUBE_API_BASE_PATH } from '@app/shared'

import { Logger } from '../utils'
import { ConnectionStore } from './ConnectionStore'

@singleton()
export class TokensStore {

    loading = false

    private _prices: Record<string, string>

    private _manifests: Record<string, TokensManifest> = {} // NetworkGroup -> TokensManifest

    constructor(
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this._prices = this.loadPrices()

        reaction(
            () => this.connectionGroup,
            async () => {
                try {
                    await this.fetchManifest()
                    await this.fetchPrices()
                }
                catch (e) {
                    this.logger.error(e)
                }
            },
            { fireImmediately: true },
        )
    }

    private get connectionGroup(): NetworkGroup {
        return this.connectionStore.selectedConnection.group
    }

    private get connectionConfig(): NetworkConfig {
        return this.connectionStore.selectedConnectionConfig
    }

    public get manifest(): TokensManifest | undefined {
        return this._manifests[this.connectionGroup]
    }

    public get meta(): Record<string, TokensManifestItem> {
        return this.manifest?.tokens.reduce((meta, token) => {
            meta[token.address] = token
            return meta
        }, {} as Record<string, TokensManifestItem>) ?? {}
    }

    public get prices(): Record<string, string> {
        if (this.connectionGroup !== 'mainnet') return EMPTY_PRICES
        return this._prices
    }

    public get everPrice(): string | undefined {
        if (this.connectionGroup !== 'mainnet') return undefined
        const wever = this.manifest?.tokens.find(({ symbol }) => symbol === 'WEVER')
        return this.prices[wever?.address ?? '']
    }

    private async fetchManifest(): Promise<void> {
        if (this.loading) return

        runInAction(() => {
            this.loading = true
        })

        try {
            const group = this.connectionGroup
            const { tokensManifestUrl } = this.connectionConfig

            if (!tokensManifestUrl) return

            const response = await fetch(tokensManifestUrl)
            const manifest: TokensManifest = await response.json()

            runInAction(() => {
                this._manifests[group] = manifest
            })
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private async fetchPrices(): Promise<void> {
        try {
            const addresses = Object.keys(this.meta)

            if (addresses.length === 0 || this.connectionGroup !== 'mainnet') return

            const url = `${FLATQUBE_API_BASE_PATH}/currencies_usdt_prices`
            const response = await fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currency_addresses: addresses,
                }),
            })

            if (response.ok) {
                const prices: Record<string, string> = await response.json()

                runInAction(() => {
                    this._prices = {
                        ...this._prices,
                        ...prices,
                    }

                    this.savePrices()
                })
            }
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private loadPrices(): Record<string, string> {
        try {
            const value = localStorage.getItem(STORAGE_KEY)
            const prices = JSON.parse(value ?? '{}')

            if (typeof prices === 'object') {
                return prices
            }
        }
        catch (e) {
            this.logger.error(e)
        }

        return {}
    }

    private savePrices(): void {
        const value = JSON.stringify(this._prices)
        localStorage.setItem(STORAGE_KEY, value)
    }

}

const STORAGE_KEY = 'wallet:usdt-prices'
const EMPTY_PRICES = {}

export interface TokensManifest {
    name: string;
    version?: {
        major: number;
        minor: number;
        patch: number;
    }
    keywords?: string[];
    timestamp?: string;
    tokens: TokensManifestItem[];
}

export interface TokensManifestItem {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
    version?: number;
}
