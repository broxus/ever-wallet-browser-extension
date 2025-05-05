import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { singleton } from 'tsyringe'
import { NetworkConfig } from 'everscale-inpage-provider'

import { PricesStore } from '@app/popup/modules/shared/store/PricesStore'
import { NetworkGroup, NetworkType } from '@app/shared'

import { Logger } from '../utils'
import { ConnectionStore } from './ConnectionStore'

@singleton()
export class TokensStore {

    private _loading = false

    private _prices: Record<string, string>

    private _manifests: Record<string, TokensManifest> = {} // NetworkGroup -> TokensManifest

    public manifestsReady = false

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

    private get connectionNetwork(): NetworkType {
        return this.connectionStore.selectedConnection.network
    }

    private get connectionConfig(): NetworkConfig {
        return this.connectionStore.selectedConnectionConfig.config
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
        if (this.connectionNetwork === 'ton') {
            return this.prices.TON
        }

        const address = this.connectionStore.connectionConfig.blockchainsByGroup[this.connectionGroup]
            ?.nativeTokenAddress
        return this.prices[address ?? '']
    }

    private async fetchManifest(): Promise<void> {
        if (this._loading) return

        runInAction(() => {
            this.manifestsReady = false
            this._loading = true
        })

        let manifestsReady = false

        try {
            const group = this.connectionGroup
            const { tokensManifestUrl } = this.connectionConfig

            if (!tokensManifestUrl) {
                manifestsReady = true
                return
            }

            const response = await fetch(tokensManifestUrl)
            const manifest: TokensManifest = await response.json()

            runInAction(() => {
                this._manifests[group] = manifest
            })
            manifestsReady = true
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this._loading = false
                this.manifestsReady = manifestsReady
            })
        }
    }

    private async fetchPrices(): Promise<void> {
        try {
            let addresses = Object.keys(this.tokens)
            if (this.connectionNetwork === 'ton') {
                addresses = [...addresses, 'TON']
            }
            const prices = await this.pricesStore.fetch(addresses, this.connectionGroup, this.connectionNetwork)

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
