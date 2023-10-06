import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import type { StoredBriefMessageInfo } from '@app/models'
import { AccountabilityStore, RpcStore, SlidingPanelStore } from '@app/popup/modules/shared'
import { SelectedAsset } from '@app/shared'

@injectable()
export class ActivityTabViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
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

    public get asset(): SelectedAsset {
        const { address } = this.selectedAccount.tonWallet
        return { type: 'ever_wallet', data: { address }}
    }

    public preloadTransactions({ lt }: nt.TransactionId): Promise<void> {
        return this.rpcStore.rpc.preloadTransactions(this.selectedAccount.tonWallet.address, lt)
    }

}
