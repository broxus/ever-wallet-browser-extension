import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'

import {
    AggregatedMultisigTransactionInfo,
    currentUtime,
    extractTokenTransactionAddress,
    extractTokenTransactionValue,
    extractTransactionAddress,
    extractTransactionValue,
    isSubmitTransaction,
} from '@app/shared'
import { AccountabilityStore, NekotonToken, RpcStore } from '@app/popup/modules/shared'
import type { Nekoton } from '@app/models'

@injectable()
export class TransactionViewModel {

    public symbol: nt.Symbol | undefined

    public transaction!: nt.TonWalletTransaction | nt.TokenWalletTransaction

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<TransactionViewModel, any>(this, {
            nekoton: false,
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

}

export enum Label {
    NONE,
    UNCONFIRMED,
    SENT,
    EXPIRED,
}
