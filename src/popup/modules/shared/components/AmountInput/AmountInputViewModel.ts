import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { NATIVE_CURRENCY_DECIMALS, SelectedAsset, TokenWalletState } from '@app/shared'

import { AccountabilityStore, ConnectionStore, RpcStore, Token, TokensStore } from '../../store'

@injectable()
export class AmountInputViewModel {

    public account!: nt.AssetsList

    public asset!: SelectedAsset

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.account.tonWallet.address]
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.accountTokenStates?.[this.account.tonWallet.address] ?? {}
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get tokens(): Record<string, Token | undefined> {
        return this.tokensStore.tokens
    }

    public get symbol(): nt.Symbol | undefined {
        if (this.asset.type === 'ever_wallet') return undefined
        return this.knownTokens[this.asset.data.rootTokenContract]
    }

    public get token(): Token | undefined {
        if (this.asset.type === 'ever_wallet') return undefined
        return this.tokens[this.asset.data.rootTokenContract]
    }

    public get balance(): string {
        return this.asset.type === 'token_wallet'
            ? this.tokenWalletStates[this.asset.data.rootTokenContract]?.balance || '0'
            : this.everWalletState?.balance || '0'
    }

    public get decimals(): number {
        return this.asset.type === 'token_wallet' ? (this.symbol?.decimals ?? 0) : NATIVE_CURRENCY_DECIMALS
    }

    public get currencyName(): string {
        return this.asset.type === 'token_wallet'
            ? this.token?.symbol ?? this.symbol?.name ?? ''
            : this.connectionStore.symbol
    }

}
