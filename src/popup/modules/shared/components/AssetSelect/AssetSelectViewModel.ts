import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, RpcStore, Token, TokensStore } from '../../store'

@injectable()
export class AssetSelectViewModel {

    public address!: string

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

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get tokens(): Record<string, Token | undefined> {
        return this.tokensStore.tokens
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        const { group } = this.connectionStore.selectedConnection
        return this.account.additionalAssets[group]?.tokenWallets ?? []
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
    symbol: nt.Symbol;
    token: Token | undefined;
}
