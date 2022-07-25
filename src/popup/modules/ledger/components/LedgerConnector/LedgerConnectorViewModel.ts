import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { LocalizationStore, RpcStore } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

@injectable()
export class LedgerConnectorViewModel {

    loading = false

    error: string | undefined

    constructor(
        private rpcStore: RpcStore,
        private localizationStore: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable<LedgerConnectorViewModel, any>(this, {
            rpcStore: false,
            localizationStore: false,
            logger: false,
        })
    }

    resetError = () => {
        this.error = undefined
    }

    setLoading = (loading: boolean) => {
        this.loading = loading
    }

    setError = (error: string) => {
        this.error = error
    }

    handleMessage = async (reply: any): Promise<boolean> => {
        this.error = undefined
        this.loading = true

        try {
            if (!reply.data?.success) {
                this.error = reply.data?.error.message
                this.logger.log('Ledger Bridge Error: ', reply.data?.error.message)
            }
            else {
                await this.rpcStore.rpc.getLedgerFirstPage()
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
