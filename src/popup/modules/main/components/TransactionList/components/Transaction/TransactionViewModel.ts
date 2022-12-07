import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import {
    AggregatedMultisigTransactionInfo,
    convertCurrency,
    currentUtime,
    extractTokenTransactionAddress,
    extractTokenTransactionValue,
    extractTransactionAddress,
    extractTransactionValue,
    isSubmitTransaction,
    NATIVE_CURRENCY,
    NATIVE_CURRENCY_DECIMALS,
} from '@app/shared'
import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class TransactionViewModel {

    public symbol: nt.Symbol | undefined

    public transaction!: nt.TonWalletTransaction | nt.TokenWalletTransaction

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<TransactionViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get transactionId(): string | undefined {
        if (isSubmitTransaction(this.transaction)) {
            return this.transaction.info.data.method.data.data.transactionId
        }

        return undefined
    }

    public get value(): Decimal {
        if (!this.symbol) {
            return extractTransactionValue(this.transaction)
        }

        return extractTokenTransactionValue(this.transaction as nt.TokenWalletTransaction) || new Decimal(0)
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
        return new Date(this.transaction.createdAt * 1000).toLocaleString('default', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })
    }

    public get expireAtFormat(): string {
        return new Date(this.expiresAt * 1000).toLocaleString('default', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })
    }

    public get decimals(): number {
        return this.symbol?.decimals ?? NATIVE_CURRENCY_DECIMALS
    }

    public get currencyName(): string {
        return this.symbol?.name ?? NATIVE_CURRENCY
    }

    public get amount(): string {
        return convertCurrency(this.value.abs().toFixed(), this.decimals)
    }

}

export enum Label {
    NONE,
    UNCONFIRMED,
    SENT,
    EXPIRED,
}
