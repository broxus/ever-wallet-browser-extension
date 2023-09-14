import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import type { StoredBriefMessageInfo } from '@app/models'
import { AccountabilityStore, Router, RpcStore } from '@app/popup/modules/shared'
import { SelectedAsset } from '@app/shared'

@injectable()
export class ActivityTabViewModel {

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get selectedAccount(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get transactions(): nt.TonWalletTransaction[] {
        return this.accountability.selectedAccountTransactions
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    public get pendingTransactions(): StoredBriefMessageInfo[] {
        return this.accountability.selectedAccountPendingTransactions
    }

    public preloadTransactions({ lt }: nt.TransactionId): Promise<void> {
        return this.rpcStore.rpc.preloadTransactions(this.selectedAccount.tonWallet.address, lt)
    }

    public showTransaction(transaction: nt.Transaction): void {
        const { hash } = transaction.id
        const { address } = this.selectedAccount.tonWallet
        const selectedAsset: SelectedAsset = { type: 'ever_wallet', data: { address }}
        this.router.navigate(`/transactions/${hash}`, {
            state: { selectedAsset },
        })
    }

}
