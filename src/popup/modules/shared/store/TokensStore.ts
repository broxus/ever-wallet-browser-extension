import {
    action, makeObservable, observable, runInAction,
} from 'mobx'
import { singleton } from 'tsyringe'

import { Logger, TOKENS_MANIFEST_URL } from '@app/shared'

@singleton()
export class TokensStore {

    manifest: TokensManifest | undefined

    meta: { [rootTokenContract: string]: TokensManifestItem } = {}

    loading = false

    constructor(private logger: Logger) {
        makeObservable(this, {
            manifest: observable,
            meta: observable,
            loading: observable,
            fetchManifest: action.bound,
        })

        this.fetchManifest().catch(this.logger.error)
    }

    async fetchManifest() {
        if (this.loading) return

        this.loading = true

        try {
            const response = await fetch(TOKENS_MANIFEST_URL)
            const manifest: TokensManifest = await response.json()

            runInAction(() => {
                this.manifest = manifest

                for (const token of manifest.tokens) {
                    this.meta[token.address] = token
                }
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
    version: {
        major: number;
        minor: number;
        patch: number;
    }
    keywords: string[];
    timestamp: string;
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
