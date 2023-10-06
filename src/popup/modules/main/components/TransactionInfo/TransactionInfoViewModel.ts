import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { AccountabilityStore, ConnectionStore, RpcStore, Token, TokensStore } from '@app/popup/modules/shared'
import { SelectedAsset } from '@app/shared'

@injectable()
export class TransactionInfoViewModel {

    public asset!: SelectedAsset

    public hash!: string

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get transactions(): nt.TokenWalletTransaction[] | nt.TonWalletTransaction[] {
        if (this.asset.type === 'ever_wallet') {
            return this.accountability.selectedAccountTransactions
        }

        // eslint-disable-next-line max-len
        const tokenTransactions = this.accountability.selectedAccountTokenTransactions[this.asset.data.rootTokenContract]

        return tokenTransactions
            ?.filter(transaction => {
                const tokenTransaction = transaction as nt.TokenWalletTransaction
                return !!tokenTransaction.info
            }) ?? []
    }

    public get transaction(): nt.Transaction | undefined {
        return (this.transactions as nt.Transaction[]).find(({ id }) => id.hash === this.hash)
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | undefined {
        return this.asset.type === 'token_wallet'
            ? this.knownTokens[this.asset.data.rootTokenContract]
            : undefined
    }

    public get token(): Token | undefined {
        return this.asset.type === 'token_wallet'
            ? this.tokensStore.tokens[this.asset.data.rootTokenContract]
            : undefined
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get currencyName(): string {
        return this.asset.type === 'ever_wallet'
            ? this.nativeCurrency
            : this.token?.symbol ?? this.symbol!.name
    }

    public async openTransactionInExplorer(hash: string): Promise<void> {
        await browser.tabs.create({
            url: this.connectionStore.transactionExplorerLink(hash),
            active: false,
        })
    }

    public async openAccountInExplorer(address: string): Promise<void> {
        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(address),
            active: false,
        })
    }

}
