import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, NotificationStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class ChangeKeyNameViewModel {

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

    public async updateMasterKeyName(key: nt.KeyStoreEntry, { name }: FormValue) {
        await this.rpcStore.rpc.updateMasterKeyName(key.masterKey, name.trim())
    }

    public async updateDerivedKey(key: nt.KeyStoreEntry, { name }: FormValue) {
        const updatedKey = {
            ...key,
            name: name.trim(),
        }

        await this.rpcStore.rpc.updateDerivedKeyName(updatedKey)

        if (this.accountability.currentDerivedKey?.publicKey === key.publicKey) {
            this.accountability.setCurrentDerivedKey(updatedKey)
        }
    }

}

export interface FormValue {
    name: string;
}
