import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem, StoredBriefMessageInfo, TokenWalletsToUpdate } from '@app/models'
import {
    AccountabilityStore,
    createEnumField,
    RpcStore,
    TokensManifest,
    TokensManifestItem,
    TokensStore,
} from '@app/popup/modules/shared'
import { TokenWalletState } from '@app/shared'

@injectable()
export class UserAssetsViewModel {

    public tab = createEnumField(Tab, Tab.Assets)

    public selectAssets = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable<UserAssetsViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            tokensStore: false,
        }, { autoBind: true })
    }

    public get tokensManifest(): TokensManifest | undefined {
        return this.tokensStore.manifest
    }

    public get tokensMeta(): Record<string, TokensManifestItem> {
        return this.tokensStore.meta
    }

    public get selectedAccount(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.selectedAccount.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
    }

    public get pendingTransactions(): StoredBriefMessageInfo[] {
        return this.accountability.selectedAccountPendingTransactions
    }

    public get everWalletState(): nt.ContractState {
        return this.accountability.everWalletState!
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.tokenWalletStates
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get transactions(): nt.TonWalletTransaction[] {
        return this.accountability.selectedAccountTransactions
    }

    public updateTokenWallets(params: TokenWalletsToUpdate): Promise<void> {
        return this.rpcStore.rpc.updateTokenWallets(this.accountability.selectedAccountAddress!, params)
    }

    public preloadTransactions({ lt }: nt.TransactionId): Promise<void> {
        return this.rpcStore.rpc.preloadTransactions(this.accountability.selectedAccountAddress!, lt)
    }

    public openSelectAssets(): void {
        this.selectAssets = true
    }

    public closeSelectAssets(): void {
        this.selectAssets = false
    }

}

export enum Tab {
    Assets,
    Transactions,
}
