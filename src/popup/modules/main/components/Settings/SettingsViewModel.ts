import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, SlidingPanelStore } from '@app/popup/modules/shared'

@injectable()
export class SettingsViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get version(): string {
        return process.env.EXT_VERSION ?? ''
    }

    public logOut(): Promise<void> {
        return this.accountability.logOut()
    }

}
