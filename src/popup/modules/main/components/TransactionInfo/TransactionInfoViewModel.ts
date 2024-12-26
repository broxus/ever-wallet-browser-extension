import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { AccountabilityStore, ConnectionStore, Router, RpcStore, Token, TokensStore } from '@app/popup/modules/shared'
import { SelectedAsset } from '@app/shared'
import { JettonSymbol, TokenWalletTransaction } from '@app/models'

@injectable()
export class TransactionInfoViewModel {

    public root: string

    public hash: string

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
        private router: Router,
    ) {
        const params = router.state.matches.at(-1)?.params
        if (!params?.root) {
            throw new Error('root must be defined')
        }
        if (!params?.hash) {
            throw new Error('hash must be defined')
        }
        this.root = params.root
        this.hash = params.hash

        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get asset(): SelectedAsset {
        return this.root === 'native'
            ? { type: 'ever_wallet', data: { address: this.account.tonWallet.address }}
            : { type: 'token_wallet', data: { rootTokenContract: this.root }}
    }

    public get account(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get transactions(): TokenWalletTransaction[] | nt.TonWalletTransaction[] {
        if (this.asset.type === 'ever_wallet') {
            return this.accountability.selectedAccountTransactions
        }

        // eslint-disable-next-line max-len
        const tokenTransactions = this.accountability.selectedAccountTokenTransactions[this.asset.data.rootTokenContract]

        return tokenTransactions
            ?.filter(transaction => {
                const tokenTransaction = transaction as TokenWalletTransaction
                return !!tokenTransaction.info
            }) ?? []
    }

    public get transaction(): nt.Transaction | undefined {
        return (this.transactions as nt.Transaction[]).find(({ id }) => id.hash === this.hash)
    }

    public get knownTokens(): Record<string, nt.Symbol | JettonSymbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | JettonSymbol | undefined {
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
