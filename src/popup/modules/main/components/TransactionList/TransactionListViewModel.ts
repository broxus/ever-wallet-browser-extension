import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type { Nekoton, StoredBriefMessageInfo } from '@app/models'
import { AccountabilityStore, ConnectionStore, Logger, NekotonToken, RpcStore } from '@app/popup/modules/shared'

export const TRANSACTION_HEIGHT = 109
export const TRANSACTION_WITH_LABEL_HEIGHT = 138
export const TRANSACTION_WITH_EXTENDED_LABEL_HEIGHT = 186
export const PRELOAD_HEIGHT = TRANSACTION_HEIGHT * 12

export const PENDING_SERVICE_MESSAGE_HEIGHT = 90
export const PENDING_TRANSFER_MESSAGE_HEIGHT = 110

@injectable()
export class TransactionListViewModel {

    public everWalletAsset!: nt.TonWalletAsset

    public transactions!: nt.Transaction[]

    public pendingTransactions: StoredBriefMessageInfo[] | undefined

    public preloadTransactions!: (continuation: nt.TransactionId) => Promise<void>

    public latestContinuation: nt.TransactionId | undefined

    private loading = false

    constructor(
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public async tryPreloadTransactions() {
        const continuation = this.transactions.at(-1)?.prevTransactionId

        if (this.loading || !continuation || continuation.lt === this.latestContinuation?.lt) return
        this.loading = true

        try {
            this.logger.log('Preloading transactions')

            await this.preloadTransactions(continuation)
            runInAction(() => {
                this.latestContinuation = continuation
            })
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
