import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore } from '@app/popup/modules/shared'
import { NftStore } from '@app/popup/modules/nft'

@injectable()
export class UserAssetsViewModel {

    constructor(
        private nftStore: NftStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get pendingNftCount(): number {
        const owner = this.accountability.selectedAccountAddress!
        const pending = this.nftStore.accountPendingNfts[owner]

        if (!pending) return 0

        return Object.values(pending)
            .reduce((count, arr) => count + arr.length, 0)
    }

    public get hasUnconfirmedTransactions(): boolean {
        return this.accountability.selectedAccountUnconfirmedTransactions.length !== 0
    }

}
