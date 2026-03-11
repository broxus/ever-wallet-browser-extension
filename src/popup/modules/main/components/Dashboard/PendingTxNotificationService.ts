import { autorun, reaction } from 'mobx'
import { singleton } from 'tsyringe'

import { AccountabilityStore, LocalizationStore, NotificationStore, RpcStore } from '@app/popup/modules/shared'

@singleton()
export class PendingTxNotificationService {

    constructor(
        private accountability: AccountabilityStore,
        private rpcStore: RpcStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
    ) {
        this.watch()
    }

    private watch(): void {
        const trackedHashes = new Set<string>()

        // Track hashes from pending txs (for when dashboard is already open when tx is sent)
        autorun(() => {
            this.accountability.selectedAccountPendingTransactions
                .forEach(tx => trackedHashes.add(tx.messageHash))
        })

        const checkConfirmed = async () => {
            const storedHash = await this.rpcStore.rpc.tempStorageRemove('pending_tx_hash') as string | undefined
            if (storedHash) trackedHashes.add(storedHash)

            if (trackedHashes.size === 0) return

            for (const tx of this.accountability.selectedAccountTransactions) {
                if (trackedHashes.has(tx.inMessage.hash)) {
                    trackedHashes.delete(tx.inMessage.hash)
                    this.notification.success(
                        this.localization.intl.formatMessage({ id: 'TRANSACTION_SENT' }),
                    )
                }
            }
        }

        checkConfirmed()

        reaction(
            () => this.accountability.selectedAccountTransactions.length,
            () => checkConfirmed(),
        )
    }

}
