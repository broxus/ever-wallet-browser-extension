import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore, SlidingPanelStore } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class SettingsViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get version(): string {
        return process.env.EXT_VERSION ? `${process.env.EXT_VERSION}${process.env.EXT_ADDITIONAL_COMMITS !== '0' ? `.${process.env.EXT_ADDITIONAL_COMMITS}` : ''}` : ''
    }

    public logOut(): Promise<void> {
        return this.accountability.logOut()
    }

    public async openNetworkSettings(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'network_settings',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

}
