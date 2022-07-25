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

    tab = createEnumField(Tab, Tab.Assets)

    selectAssets = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable<UserAssetsViewModel, any>(this, {
            accountability: false,
        })
    }

    get tokensManifest(): TokensManifest | undefined {
        return this.tokensStore.manifest
    }

    get tokensMeta(): Record<string, TokensManifestItem> {
        return this.tokensStore.meta
    }

    get selectedAccount(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    get tonWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.selectedAccount.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
    }

    get pendingTransactions(): StoredBriefMessageInfo[] {
        return this.accountability.selectedAccountPendingTransactions
    }

    get tonWalletState(): nt.ContractState {
        return this.accountability.tonWalletState!
    }

    get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.tokenWalletStates
    }

    get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    get transactions(): nt.TonWalletTransaction[] {
        return this.accountability.selectedAccountTransactions
    }

    updateTokenWallets = (
        params: TokenWalletsToUpdate,
    ) => this.rpcStore.rpc.updateTokenWallets(this.accountability.selectedAccountAddress!, params)

    preloadTransactions = (
        { lt }: nt.TransactionId,
    ) => this.rpcStore.rpc.preloadTransactions(this.accountability.selectedAccountAddress!, lt)

    openSelectAssets = () => {
        this.selectAssets = true
    }

    closeSelectAssets = () => {
        this.selectAssets = false
    }

}

export enum Tab {
    Assets,
    Transactions,
}
