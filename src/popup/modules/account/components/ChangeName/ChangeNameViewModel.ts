import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, NotificationStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class ChangeNameViewModel {

    public keyEntry!: nt.KeyStoreEntry

    public loading = false

    constructor(
        public notification: NotificationStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public async submit(key: nt.KeyStoreEntry, { name }: FormValue) {
        await this.rpcStore.rpc.updateMasterKeyName(key.masterKey, name.trim())
    }

}

export interface FormValue {
    name: string;
}
