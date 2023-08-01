import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionStore, Logger } from '@app/popup/modules/shared'

@injectable()
export class TransactionListViewModel {

    public transactions!: nt.Transaction[]

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
