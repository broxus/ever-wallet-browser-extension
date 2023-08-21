import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AggregatedMultisigTransactionInfo, convertCurrency, currentUtime, extractTokenTransactionAddress, extractTokenTransactionValue, extractTransactionAddress, extractTransactionValue, isSubmitTransaction, NATIVE_CURRENCY_DECIMALS } from '@app/shared'
import { AccountabilityStore, ConnectionStore, RpcStore, Token, TokensStore } from '@app/popup/modules/shared'

@injectable()
export class TransactionViewModel {

    public symbol: nt.Symbol | undefined

    public transaction!: nt.TonWalletTransaction | nt.TokenWalletTransaction

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get transactionId(): string | undefined {
        if (isSubmitTransaction(this.transaction)) {
            return this.transaction.info.data.method.data.data.transactionId
        }

        return undefined
    }

    public get value(): BigNumber {
        if (!this.symbol) {
            return extractTransactionValue(this.transaction)
        }

        return extractTokenTransactionValue(this.transaction as nt.TokenWalletTransaction) ?? new BigNumber(0)
    }

    public get recipient() {
        if (!this.symbol) {
            return extractTransactionAddress(this.transaction)
        }

        return extractTokenTransactionAddress(this.transaction as nt.TokenWalletTransaction)
    }

    public get unconfirmedTransaction(): nt.MultisigPendingTransaction | undefined {
        const source = this.transaction.inMessage.dst

        if (source && this.transactionId) {
            return this.rpcStore.state.accountUnconfirmedTransactions[source]?.[this.transactionId]
        }

        return undefined
    }

    public get multisigTransaction(): AggregatedMultisigTransactionInfo | undefined {
        const source = this.transaction.inMessage.dst

        if (source && this.transactionId) {
            return this.rpcStore.state.accountMultisigTransactions[source]?.[this.transactionId]
        }

        return undefined
    }

    public get expiresAt(): number {
        return this.transaction.createdAt + (this.accountability.contractTypeDetails?.expirationTime || 3600)
    }

    public get labelType(): Label {
        const now = currentUtime(this.rpcStore.state.clockOffset)

        if (isSubmitTransaction(this.transaction) && this.multisigTransaction) {
            if (this.multisigTransaction.finalTransactionHash) {
                return Label.SENT
            }

            return this.expiresAt > now ? Label.UNCONFIRMED : Label.EXPIRED
        }

        return Label.NONE
    }

    public get createdAtFormat(): string {
        return dateFormat.format(this.transaction.createdAt * 1000)
    }

    public get expireAtFormat(): string {
        return dateFormat.format(this.expiresAt * 1000)
    }

    public get decimals(): number {
        return this.symbol?.decimals ?? NATIVE_CURRENCY_DECIMALS
    }

    public get currencyName(): string {
        return this.token?.symbol ?? this.symbol?.name ?? this.nativeCurrency
    }

    public get amount(): string {
        return convertCurrency(this.value.abs().toFixed(), this.decimals)
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    private get token(): Token | undefined {
        return this.symbol ? this.tokensStore.tokens[this.symbol.rootTokenContract] : undefined
    }

}

export enum Label {
    NONE,
    UNCONFIRMED,
    SENT,
    EXPIRED,
}

const dateFormat = new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
})
