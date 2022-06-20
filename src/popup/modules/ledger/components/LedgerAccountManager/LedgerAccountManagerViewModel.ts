import { createEnumField, RpcStore } from '@app/popup/modules/shared';
import { Logger } from '@app/shared';
import { Buffer } from 'buffer';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class LedgerAccountManagerViewModel {
  name: string | undefined;
  onBack!: () => void;
  step = createEnumField(Step, Step.Select);

  constructor(
    private rpcStore: RpcStore,
    private logger: Logger,
  ) {
    makeAutoObservable<LedgerAccountManagerViewModel, any>(this, {
      rpcStore: false,
      logger: false,
    });
  }

  onSuccess = async () => {
    try {
      if (this.name) {
        const bufferKey = await this.rpcStore.rpc.getLedgerMasterKey();
        const masterKey = Buffer.from(Object.values(bufferKey)).toString('hex');
        await this.rpcStore.rpc.updateMasterKeyName(masterKey, this.name);
      }

      this.onBack();
    } catch (e) {
      this.step.setConnect();
      this.logger.error(e);
    }
  };
}

export enum Step {
  Connect,
  Select,
}
