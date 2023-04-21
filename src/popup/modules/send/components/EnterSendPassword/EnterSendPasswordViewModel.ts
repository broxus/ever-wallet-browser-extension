import { computed, makeObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore } from '@app/popup/modules/shared'

@injectable()
export class EnterSendPasswordViewModel {

    constructor(
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeObservable(this, {
            masterKeysNames: computed,
            nativeCurrency: computed,
        })
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

}
