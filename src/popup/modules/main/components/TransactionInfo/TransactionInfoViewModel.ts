import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { AccountabilityStore, ConnectionStore, Router, RpcStore, Token, TokensStore } from '@app/popup/modules/shared'
import { SelectedAsset } from '@app/shared'

@injectable()
export class TransactionInfoViewModel {

    public selectedAsset: SelectedAsset

    public selectedTransactionHash: string | undefined

    constructor(
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.selectedAsset = router.state.location.state.selectedAsset
        this.selectedTransactionHash = router.state.matches.at(-1)?.params?.hash
    }

    public get account(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get transactions(): nt.TokenWalletTransaction[] | nt.TonWalletTransaction[] {
        if (this.selectedAsset.type === 'ever_wallet') {
            return this.accountability.selectedAccountTransactions
        }

        // eslint-disable-next-line max-len
        const tokenTransactions = this.accountability.selectedAccountTokenTransactions[this.selectedAsset.data.rootTokenContract]

        return tokenTransactions
            ?.filter(transaction => {
                const tokenTransaction = transaction as nt.TokenWalletTransaction
                return !!tokenTransaction.info
            }) ?? []
    }

    public get selectedTransaction(): nt.Transaction | undefined {
        if (!this.selectedTransactionHash) return undefined

        return (this.transactions as nt.Transaction[]).find(({ id }) => id.hash === this.selectedTransactionHash)
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | undefined {
        return this.selectedAsset.type === 'token_wallet'
            ? this.knownTokens[this.selectedAsset.data.rootTokenContract]
            : undefined
    }

    public get token(): Token | undefined {
        return this.selectedAsset.type === 'token_wallet'
            ? this.tokensStore.tokens[this.selectedAsset.data.rootTokenContract]
            : undefined
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get currencyName(): string {
        return this.selectedAsset.type === 'ever_wallet'
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
