import { createEnumField, RpcStore } from '@app/popup/modules/shared';
import { Logger } from '@app/shared';
import { injectable } from 'tsyringe';

@injectable()
export class LedgerSignInViewModel {
  step = createEnumField(Step, Step.Select);

  constructor(
    private rpcStore: RpcStore,
    private logger: Logger,
  ) {

  }

  onSuccess = async () => {
    try {
      const bufferKey = await this.rpcStore.rpc.getLedgerMasterKey();
      const masterKey = Buffer.from(Object.values(bufferKey)).toString('hex');

      await this.rpcStore.rpc.selectMasterKey(masterKey);
    } catch (e) {
      this.logger.error(e);
      this.step.setConnect();
    }
  };
}

export enum Step {
  Connect,
  Select,
}
