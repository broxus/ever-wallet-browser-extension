import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { AccountabilityStore, NekotonToken, RpcStore } from '@app/popup/modules/shared'
import { type Nekoton } from '@app/models'

@injectable()
export class CreateSuccessViewModel {

    public loading = false

    constructor(
        private accountability: AccountabilityStore,
        private rpcStore: RpcStore,
        @inject(NekotonToken) private nekoton: Nekoton,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    close() {
        this.rpcStore.rpc.sendEvent({
            type: 'close-modals',
            data: {},
        })
        window.close()
    }

    async switch(address: string): Promise<void> {
        if (this.loading) return
        this.loading = true
        await this.accountability.selectAccount(address)

        this.rpcStore.rpc.sendEvent({
            type: 'close-modals',
            data: {},
        })
        window.close()
    }

}
