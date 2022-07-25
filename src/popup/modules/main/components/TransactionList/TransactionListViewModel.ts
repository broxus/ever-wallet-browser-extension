import type nt from '@wallet/nekoton-wasm'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { Disposable, inject, injectable } from 'tsyringe'

import { Nekoton, StoredBriefMessageInfo } from '@app/models'
import { NekotonToken, RpcStore } from '@app/popup/modules/shared'
import { AggregatedMultisigTransactions, currentUtime, Logger } from '@app/shared'

export const TRANSACTION_HEIGHT = 109
export const TRANSACTION_WITH_LABEL_HEIGHT = 138
export const TRANSACTION_WITH_EXTENDED_LABEL_HEIGHT = 186
export const PRELOAD_HEIGHT = TRANSACTION_HEIGHT * 12

export const PENDING_SERVICE_MESSAGE_HEIGHT = 90
export const PENDING_TRANSFER_MESSAGE_HEIGHT = 110

@injectable()
export class TransactionListViewModel implements Disposable {

    tonWalletAsset!: nt.TonWalletAsset

    transactions!: nt.Transaction[]

    pendingTransactions: StoredBriefMessageInfo[] | undefined

    preloadTransactions!: (continuation: nt.TransactionId) => Promise<void>

    scroll = 0

    latestContinuation: nt.TransactionId | undefined

    private loading = false

    private disposer: () => void

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<TransactionListViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            logger: false,
            disposer: false,
        })

        this.disposer = autorun(async () => {
            if (!this.transactions) return

            const continuation = this.transactions[this.transactions.length - 1]?.prevTransactionId
            const totalHeight = this.transactions.length * TRANSACTION_HEIGHT
            const currentHeight = totalHeight - this.scroll

            if (!continuation || currentHeight > PRELOAD_HEIGHT || continuation.lt === this.latestContinuation?.lt) {
                return
            }

            await this.tryPreloadTransactions(continuation)
        })
    }

    dispose(): Promise<void> | void {
        this.disposer()
    }

    get accountMultisigTransactions(): Record<string, AggregatedMultisigTransactions> {
        return this.rpcStore.state.accountMultisigTransactions
    }

    get multisigTransactions(): AggregatedMultisigTransactions | undefined {
        return this.accountMultisigTransactions[this.tonWalletAsset.address]
    }

    get tonWalletDetails(): nt.TonWalletDetails {
        return this.nekoton.getContractTypeDetails(this.tonWalletAsset.contractType)
    }

    get clockOffset(): number {
        return this.rpcStore.state.clockOffset
    }

    get transactionHeights(): number[] {
        const now = currentUtime(this.clockOffset)

        return this.transactions.map<number>((transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction) => {
            if (transaction.info?.type === 'wallet_interaction' && transaction.info?.data.method.type === 'multisig') {
                switch (transaction.info.data.method.data.type) {
                    case 'confirm':
                        return 0

                    case 'submit':
                        const { transactionId } = transaction.info.data.method.data.data

                        if (
                            transactionId === '0'
                            || transaction.outMessages.some(msg => msg.dst != null)
                        ) {
                            break
                        }

                        const multisigTransaction = this.multisigTransactions?.[transactionId]

                        if (
                            multisigTransaction == null
                            || multisigTransaction.finalTransactionHash != null
                        ) {
                            break
                        }

                        if (transaction.createdAt + this.tonWalletDetails.expirationTime <= now) {
                            return TRANSACTION_WITH_LABEL_HEIGHT
                        }

                        return TRANSACTION_WITH_EXTENDED_LABEL_HEIGHT

                    default:
                        break
                }
            }

            return TRANSACTION_HEIGHT
        })
    }

    get totalHeight(): number {
        return this.transactionHeights.reduce((sum, value) => sum + value, 0)
    }

    get pendingTransactionsHeight(): number {
        return this.pendingTransactions?.reduce((sum, { type }) => {
            switch (type) {
                case 'transfer':
                    return sum + PENDING_TRANSFER_MESSAGE_HEIGHT

                case 'deploy':
                case 'confirm':
                    return sum + PENDING_SERVICE_MESSAGE_HEIGHT

                default:
                    return sum
            }
        }, 0) ?? 0
    }

    setScroll(scroll: number) {
        this.scroll = scroll
    }

    private setLatestContinuation(continuation: nt.TransactionId) {
        this.latestContinuation = continuation
    }

    private async tryPreloadTransactions(continuation: nt.TransactionId) {
        if (this.loading) return

        this.loading = true

        try {
            this.logger.log('Preloading transactions')

            await this.preloadTransactions(continuation)
            this.setLatestContinuation(continuation)
        }
        catch (e: any) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
