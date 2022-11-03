import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, createEnumField } from '@app/popup/modules/shared'
import { NftStore } from '@app/popup/modules/nft'

@injectable()
export class UserAssetsViewModel {

    public tab = createEnumField(Tab, Tab.Tokens)

    constructor(
        private nftStore: NftStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<UserAssetsViewModel, any>(this, {
            nftStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get pendingNftCount(): number {
        const owner = this.accountability.selectedAccountAddress!
        return this.nftStore.accountPendingNfts[owner]?.length ?? 0
    }

}

export enum Tab {
    Tokens,
    Nft,
}
