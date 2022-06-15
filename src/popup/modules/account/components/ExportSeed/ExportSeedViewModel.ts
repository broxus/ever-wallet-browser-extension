import { AccountabilityStore, createEnumField, RpcStore } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class ExportSeedViewModel {
  step = createEnumField(Step, Step.PasswordRequest);

  inProcess = false;
  error = '';
  seedPhrase: string[] = [];

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<ExportSeedViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
    });
  }

  onSubmit = async ({ password }: { password: string }) => {
    if (!this.accountability.currentMasterKey) return;

    this.inProcess = true;

    try {
      const exportKey = this.prepareExportKey(this.accountability.currentMasterKey, password);
      const { phrase } = await this.rpcStore.rpc.exportMasterKey(exportKey);

      runInAction(() => {
        this.seedPhrase = phrase.split(' ');
        this.step.setCopySeedPhrase();
      });
    } catch (e) {
      runInAction(() => {
        this.error = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.inProcess = false;
      });
    }
  };

  private prepareExportKey = (entry: nt.KeyStoreEntry, password: string): nt.ExportKey => {
    switch (entry.signerName) {
      case 'encrypted_key':
        return {
          type: entry.signerName,
          data: {
            publicKey: entry.publicKey,
            password,
          },
        } as nt.ExportKey;
      case 'master_key':
        return {
          type: entry.signerName,
          data: {
            masterKey: entry.masterKey,
            password,
          },
        } as nt.ExportKey;

      case 'ledger_key':
      default:
        throw new Error(`[ExportSeedViewModel] Unsupported operation: ${entry.signerName}`);
    }
  };
}

export enum Step {
  PasswordRequest,
  CopySeedPhrase,
  SeedPhraseCopied,
}
