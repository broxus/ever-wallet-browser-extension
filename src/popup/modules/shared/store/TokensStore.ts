import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { ConnectionGroup } from '@app/models'
import { FLATQUBE_API_BASE_PATH, Logger, ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG, TOKENS_MANIFEST_URL } from '@app/shared'
import StEverLogo from '@app/popup/assets/img/stake/stever-logo.svg'

import { RpcStore } from './RpcStore'

@singleton()
export class TokensStore {

    loading = false

    prices: Record<string, string>

    private _manifest: TokensManifest | undefined // mainnet manifest

    constructor(
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<TokensStore, any>(this, {
            rpcStore: false,
            logger: false,
        }, { autoBind: true })

        this.prices = this.loadPrices()

        this.fetchManifest()
            .then(() => this.fetchPrices())
            .catch(this.logger.error)
    }

    private get connectionGroup(): ConnectionGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    public get manifest(): TokensManifest | undefined {
        switch (this.connectionGroup) {
            case 'mainnet':
                return this._manifest
            case 'broxustestnet':
                return {
                    name: 'TIP3 Tokens List',
                    tokens: [{
                        name: 'Staked Ever',
                        symbol: 'STEVER',
                        decimals: 9,
                        address: ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG[this.connectionGroup]!,
                        logoURI: StEverLogo,
                    }],
                }
            default:
                return undefined
        }
    }

    public get meta(): Record<string, TokensManifestItem> {
        return this.manifest?.tokens.reduce((meta, token) => {
            meta[token.address] = token
            return meta
        }, {} as Record<string, TokensManifestItem>) ?? {}
    }

    public get everPrice(): string | undefined {
        const wever = this.manifest?.tokens.find(({ symbol }) => symbol === 'WEVER')
        return this.prices[wever?.address ?? '']
    }

    private async fetchManifest(): Promise<void> {
        if (this.loading) return

        runInAction(() => {
            this.loading = true
        })

        try {
            const response = await fetch(TOKENS_MANIFEST_URL)
            const manifest: TokensManifest = await response.json()

            runInAction(() => {
                this._manifest = manifest
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

            if (addresses.length === 0) return

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
                    this.prices = {
                        ...this.prices,
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
            const value = localStorage.getItem('usdt-prices')
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
        const value = JSON.stringify(this.prices)
        localStorage.setItem('usdt-prices', value)
    }

}

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
