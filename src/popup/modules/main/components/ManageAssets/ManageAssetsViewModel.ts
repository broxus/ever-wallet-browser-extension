import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem, TokenWalletsToUpdate } from '@app/models'
import { AccountabilityStore, Router, RpcStore, Token, TokensManifest, TokensStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class ManageAssetsViewModel {

    public loading = false

    public error = ''

    constructor(
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get tokensManifest(): TokensManifest | undefined {
        return this.tokensStore.manifest
    }

    public get tokens(): Record<string, Token | undefined> {
        return this.tokensStore.tokens
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.accountability.selectedAccount?.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get manifestLoading(): boolean {
        return this.tokensStore.loading
    }

    public async submit(params: TokenWalletsToUpdate): Promise<void> {
        if (this.loading || !this.accountability.selectedAccountAddress || Object.keys(params).length === 0) return
        this.loading = true

        try {
            await this.rpcStore.rpc.updateTokenWallets(this.accountability.selectedAccountAddress, params)
            await this.router.navigate('/')
        }
        catch (e: any) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
