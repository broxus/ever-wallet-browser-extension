import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { NATIVE_CURRENCY_DECIMALS, SelectedAsset, TokenWalletState } from '@app/shared'
import { JettonSymbol } from '@app/models'

import { AccountabilityStore, ConnectionStore, RpcStore, Token, TokensStore } from '../../store'

@injectable()
export class AssetSelectViewModel {

    public address!: string

    public asset!: SelectedAsset

    public opened = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get account(): nt.AssetsList {
        return this.accountability.accountEntries[this.address]
    }

    public get knownTokens(): Record<string, nt.Symbol | JettonSymbol> {
        return this.rpcStore.state.knownTokens
    }

    public get tokens(): Record<string, Token | undefined> {
        return this.tokensStore.tokens
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        const { group } = this.connectionStore.selectedConnection
        return this.account.additionalAssets[group]?.tokenWallets ?? []
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.accountTokenStates?.[this.account.tonWallet.address] ?? {}
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.account.tonWallet.address]
    }

    public get symbol(): nt.Symbol | JettonSymbol | undefined {
        if (this.asset.type === 'ever_wallet') return undefined
        return this.knownTokens[this.asset.data.rootTokenContract]
    }

    public get balance(): string {
        return this.asset.type === 'token_wallet'
            ? this.tokenWalletStates[this.asset.data.rootTokenContract]?.balance || '0'
            : this.everWalletState?.balance || '0'
    }

    public get decimals(): number {
        return this.asset.type === 'token_wallet' ? this.symbol?.decimals ?? 0 : NATIVE_CURRENCY_DECIMALS
    }

    public get list(): Item[] {
        const list: Item[] = []
        for (const { rootTokenContract } of this.tokenWalletAssets) {
            const symbol = this.knownTokens[rootTokenContract]
            const token = this.tokens[rootTokenContract]

            if (symbol) {
                list.push({ symbol, token })
            }
        }
        return list
    }

    public filter(list: Item[], search: string): Item[] {
        return list.filter(
            ({ symbol, token }) => (token?.symbol ?? symbol.name).toLowerCase().includes(search)
                || (token?.name ?? symbol.fullName).toLowerCase().includes(search),
        )
    }

    public handleOpen(): void {
        this.opened = true
    }

    public handleClose(): void {
        this.opened = false
    }

}

interface Item {
    symbol: nt.Symbol | JettonSymbol;
    token: Token | undefined;
}
