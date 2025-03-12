import type * as nt from '@broxus/ever-wallet-wasm'
import { computed, makeObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, SettingsStore } from '@app/popup/modules/shared'

@injectable()
export class EnterSendPasswordViewModel {

    public keyEntry!: nt.KeyStoreEntry

    constructor(
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private settings: SettingsStore,
    ) {
        makeObservable(this, {
            masterKeysNames: computed,
            nativeCurrency: computed,
        })
    }

    public get cache(): boolean {
        return this.settings.data[this.keyEntry.masterKey]?.cache ?? false
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get decimals(): number {
        return this.connectionStore.decimals
    }

}
