import { injectable } from 'tsyringe'

import { createEnumField, RpcStore } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

@injectable()
export class LedgerSignInViewModel {

    public step = createEnumField(Step, Step.Select)

    constructor(
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {

    }

    public async onSuccess(): Promise<void> {
        try {
            const masterKey = await this.rpcStore.rpc.getLedgerMasterKey()

            await this.rpcStore.rpc.selectMasterKey(masterKey)

            window.close()
        }
        catch (e) {
            this.logger.error(e)
            this.step.setConnect()
        }
    }

}

export enum Step {
    Connect,
    Select,
}
