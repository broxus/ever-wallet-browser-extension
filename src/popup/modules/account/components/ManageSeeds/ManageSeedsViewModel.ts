import { AccountabilityStep, AccountabilityStore, RpcStore } from '@app/popup/modules/shared';
import { Logger } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class ManageSeedsViewModel {
  inProgress = false;

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
    private logger: Logger,
  ) {
    makeAutoObservable<ManageSeedsViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
      logger: false,
    });
  }

  get masterKeys(): nt.KeyStoreEntry[] {
    return this.accountability.masterKeys;
  }

  get masterKeysNames(): Record<string, string> {
    return this.accountability.masterKeysNames;
  }

  get selectedMasterKey(): string | undefined {
    return this.accountability.selectedMasterKey;
  }

  onManageMasterKey = (seed: nt.KeyStoreEntry) => this.accountability.onManageMasterKey(seed);

  addSeed = () => {
    this.accountability.reset();
    this.accountability.setStep(AccountabilityStep.CREATE_SEED);
  };

  onBackup = async () => {
    this.inProgress = true;

    try {
      const storage = await this.rpcStore.rpc.exportStorage();

      this.downloadFileAsText(storage);
    } catch (e) {
      this.logger.error(e);
    } finally {
      runInAction(() => {
        this.inProgress = false;
      });
    }
  };

  private downloadFileAsText = (text: string) => {
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = 'ever-wallet-backup.json';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
}
