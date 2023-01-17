import { injectable } from 'tsyringe'
import { makeAutoObservable } from 'mobx'

import { createEnumField, RpcStore } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

@injectable()
export class LedgerSignInViewModel {

    public step = createEnumField<typeof Step>(Step.Select)

    constructor(
        public rpcStore: RpcStore,
        public logger: Logger,
    ) {
        makeAutoObservable(this, {
            rpcStore: false,
            logger: false,
        }, { autoBind: true })
    }

    public async onSuccess(): Promise<void> {
        try {
            const masterKey = await this.rpcStore.rpc.getLedgerMasterKey()

            await this.rpcStore.rpc.selectMasterKey(masterKey)
            await this.rpcStore.rpc.ensureAccountSelected()

            window.close()
        }
        catch (e) {
            this.logger.error(e)
            this.step.setValue(Step.Connect)
        }
    }

}

export enum Step {
    Connect,
    Select,
}
