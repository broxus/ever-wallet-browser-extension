import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { LocalizationStore, Logger, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class LedgerConnectorViewModel {

    public loading = false

    public error: string | undefined

    constructor(
        private rpcStore: RpcStore,
        private localizationStore: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public resetError(): void {
        this.error = undefined
    }

    public setLoading(loading: boolean): void {
        this.loading = loading
    }

    public setError(error: string): void {
        this.error = error
    }

    async handleMessage(reply: any): Promise<boolean> {
        this.error = undefined
        this.loading = true

        try {
            if (!reply.data?.success) {
                this.error = reply.data?.error.message
                this.logger.log('Ledger Bridge Error: ', this.error)
            }
            else {
                await this.rpcStore.rpc.getLedgerMasterKey()
                this.logger.log('Ledger Bridge Data: ', reply.data?.payload)

                return true
            }
        }
        catch (e) {
            this.logger.log('Ledger Bridge Error: ', e)

            this.setError(
                this.localizationStore.intl.formatMessage({ id: 'ERROR_FAILED_TO_CONNECT_TO_LEDGER' }),
            )
        }
        finally {
            this.setLoading(false)
        }

        return false
    }

}
