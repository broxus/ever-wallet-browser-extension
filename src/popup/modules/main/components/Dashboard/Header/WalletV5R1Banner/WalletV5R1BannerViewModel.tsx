import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, SlidingPanelStore } from '@app/popup/modules/shared'

@injectable()
export class WalletV5R1BannerViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get visible(): boolean {
        return this.accountability.selectedAccount?.tonWallet.contractType === 'WalletV5R1'
            && ['everscale', 'venom'].includes(this.connectionStore.selectedConnectionNetworkType)
    }

}
