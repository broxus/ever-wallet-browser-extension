import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { Logger, ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG, TOKENS_MANIFEST_URL } from '@app/shared'
import StEverLogo from '@app/popup/assets/img/stake/stever-logo.svg'

import { RpcStore } from './RpcStore'

@singleton()
export class TokensStore {

    manifest: TokensManifest | undefined

    loading = false

    constructor(
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<TokensStore, any>(this, {
            rpcStore: false,
            logger: false,
        }, { autoBind: true })

        reaction(
            () => this.rpcStore.state.selectedConnection.group,
            (group) => {
                runInAction(() => {
                    this.manifest = undefined
                })

                if (group === 'mainnet') {
                    this.fetchManifest().catch(this.logger.error)
                }
                else if (group === 'broxustestnet') {
                    runInAction(() => {
                        this.manifest = {
                            name: 'TIP3 Tokens List',
                            tokens: [{
                                name: 'Staked Ever',
                                symbol: 'STEVER',
                                decimals: 9,
                                address: ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG[group]!,
                                logoURI: StEverLogo,
                            }],
                        }
                    })
                }
            },
            { fireImmediately: true },
        )
    }

    public get meta(): Record<string, TokensManifestItem> {
        return this.manifest?.tokens.reduce((meta, token) => {
            meta[token.address] = token
            return meta
        }, {} as Record<string, TokensManifestItem>) ?? {}
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
                this.manifest = manifest
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
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
