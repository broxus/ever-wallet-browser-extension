import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { NotificationStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class ChangeAccountNameViewModel {

    constructor(
        public notification: NotificationStore,
        private rpcStore: RpcStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async updateAccountName(account: nt.AssetsList, { name }: FormValue) {
        await this.rpcStore.rpc.renameAccount(account.tonWallet.address, name.trim())
    }

}

export interface FormValue {
    name: string;
}
