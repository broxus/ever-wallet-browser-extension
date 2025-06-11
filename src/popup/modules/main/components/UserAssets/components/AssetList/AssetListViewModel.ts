import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem, type JettonSymbol, TokenWalletsToUpdate } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    RpcStore,
    Token,
    TokensManifest,
    TokensStore,
} from '@app/popup/modules/shared'
import { TokenWalletState } from '@app/shared'

@injectable()
export class AssetListViewModel {

    public selectAssets = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
        private connectionStore: ConnectionStore,
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

    public get everWalletAsset(): nt.TonWalletAsset | undefined {
        return this.accountability.selectedAccount?.tonWallet
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.accountability.selectedAccount?.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
    }

    public get everWalletState(): nt.ContractState {
        return this.accountability.everWalletState!
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.tokenWalletStates
    }

    public get knownTokens(): Record<string, nt.Symbol | JettonSymbol> {
        return this.rpcStore.state.knownTokens
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get hasUnconfirmedTransactions(): boolean {
        return this.accountability.selectedAccountUnconfirmedTransactions.length !== 0
    }

    public get manifestLoading(): boolean {
        return this.tokensStore.loading
    }

    public updateTokenWallets(params: TokenWalletsToUpdate): Promise<void> {
        return this.rpcStore.rpc.updateTokenWallets(this.accountability.selectedAccountAddress!, params)
    }

    public openSelectAssets(): void {
        this.selectAssets = true
    }

    public closeSelectAssets(): void {
        this.selectAssets = false
    }

}
