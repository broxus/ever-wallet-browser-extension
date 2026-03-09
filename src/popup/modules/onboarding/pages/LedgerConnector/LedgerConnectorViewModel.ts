import { injectable } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'

import { AccountabilityStore, ConnectionStore, Logger, NotificationStore, RpcStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { getDefaultContractType } from '@app/shared'

@injectable()
export class LedgerConnectorViewModel {

    public loading = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private logger: Logger,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async save(): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            const key = await this.rpcStore.rpc.createLedgerKey({ accountId: 0 })
            const keys = this.accountability.getLedgerKeysToScan(key)

            try {
                for await (const key of keys) {
                    const isMasterKey = key.masterKey === key.publicKey
                    const accounts = await this.accountability.addExistingWallets(key.publicKey)

                    if (isMasterKey && accounts.length === 0) {
                        const { selectedConnectionNetworkGroup, workchainId, connectionConfig } = this.connectionStore
                        await this.rpcStore.rpc.createAccount({
                            name: key.name,
                            contractType: getDefaultContractType(selectedConnectionNetworkGroup, connectionConfig),
                            publicKey: key.publicKey,
                            workchain: workchainId,
                        }, true)
                    }

                    if (!isMasterKey && !accounts.length && !this.accountability.accountsByPublicKey[key.publicKey]) {
                        await this.rpcStore.rpc.removeKey({ publicKey: key.publicKey })
                        // stop scanning on first empty key
                        break
                    }
                }
            }
            catch (e: any) {
                this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error)

                throw e
            }

            await this.rpcStore.rpc.selectMasterKey(key.masterKey)
            await this.rpcStore.rpc.ensureAccountSelected()
        }
        catch (e: any) {
            this.logger.error(e)
            this.showError(parseError(e))
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private showError(message: string): void {
        this.notification.error(message)
    }

}
