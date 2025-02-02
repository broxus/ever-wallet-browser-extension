import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import type { NetworkConfig, NetworkGroup } from '@app/models'
import { PricesStore } from '@app/popup/modules/shared/store/PricesStore'
import { NETWORK_GROUP } from '@app/shared'

import { Logger } from '../utils'
import { ConnectionStore } from './ConnectionStore'

@singleton()
export class TokensStore {

    private _loading = false

    private _prices: Record<string, string>

    private _manifests: Record<string, TokensManifest> = {} // NetworkGroup -> TokensManifest

    constructor(
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private pricesStore: PricesStore,
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

    public get loading(): boolean {
        return this._loading
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

    public get tokens(): Record<string, Token | undefined> {
        return this.manifest?.tokens.reduce((meta, token) => {
            meta[token.address] = token
            return meta
        }, {} as Record<string, Token>) ?? {}
    }

    public get prices(): Record<string, string> {
        return this._prices
    }

    public get everPrice(): string | undefined {
        if (this.connectionGroup === NETWORK_GROUP.TON) {
            return this.prices.TON
        }

        const symbol = (() => {
            switch (this.connectionGroup) {
                case NETWORK_GROUP.MAINNET_EVERSCALE:
                    return 'WEVER'
                case NETWORK_GROUP.MAINNET_VENOM:
                    return 'WVENOM'
                case NETWORK_GROUP.TESTNET_TYCHO:
                    return 'WTYCHO'
                case NETWORK_GROUP.HAMSTER:
                    return 'wHMSTR'
                default:
                    return undefined
            }
        })()

        if (symbol) {
            const token = this.manifest?.tokens.find(item => item.symbol === symbol)
            return this.prices[token?.address ?? '']
        }

        return undefined
    }

    private async fetchManifest(): Promise<void> {
        if (this._loading) return

        runInAction(() => {
            this._loading = true
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
                this._loading = false
            })
        }
    }

    private async fetchPrices(): Promise<void> {
        try {
            let addresses = Object.keys(this.tokens)
            if (this.connectionGroup === NETWORK_GROUP.TON) {
                addresses = [...addresses, 'TON']
            }
            const prices = await this.pricesStore.fetch(addresses, this.connectionGroup)

            if (prices) {
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

export interface TokensManifest {
    name: string;
    version?: {
        major: number;
        minor: number;
        patch: number;
    }
    keywords?: string[];
    timestamp?: string;
    tokens: Token[];
}

export interface Token {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
    version?: number;
}
