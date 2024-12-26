import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import type { ConnectionDataItem, JettonSymbol } from '@app/models'
import { AccountabilityStore, ConnectionStore, RpcStore, SlidingPanelStore, Token, TokensManifest, TokensStore } from '@app/popup/modules/shared'
import { TokenWalletState } from '@app/shared'

@injectable()
export class AssetListViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get manifest(): TokensManifest | undefined {
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

}
