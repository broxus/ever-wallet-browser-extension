import { Nekoton } from '@app/models';
import { createEnumField, NekotonToken, RpcStore } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import { DEFAULT_CONTRACT_TYPE, Logger } from '@app/shared';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import type { ContractType, GeneratedMnemonic, KeyStoreEntry, MnemonicType } from 'nekoton-wasm';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ImportAccountViewModel {
  step = createEnumField(Step, Step.SelectContractType);
  contractType = DEFAULT_CONTRACT_TYPE;
  inProcess = false;
  error: string | undefined;

  private seed: GeneratedMnemonic | null = null;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private logger: Logger,
  ) {
    makeObservable(this, {
      contractType: observable,
      inProcess: observable,
      error: observable,
      wordCount: computed,
      setContractType: action,
      submit: action,
      submitSeed: action,
      resetError: action,
    });
  }

  get wordCount(): number {
    return this.contractType === 'WalletV3' ? 24 : 12;
  }

  setContractType = (type: ContractType) => {
    this.contractType = type;
    this.step.setEnterPhrase();
  };

  resetError = () => {
    this.error = undefined;
  };

  submitSeed = (words: string[]) => {
    const phrase = words.join(' ');
    const mnemonicType: MnemonicType = this.contractType === 'WalletV3' ? { type: 'legacy' } : { type: 'labs', accountId: 0 };

    try {
      this.nekoton.validateMnemonic(phrase, mnemonicType);
      this.seed = { phrase, mnemonicType };

      this.step.setEnterPassword();
    } catch (e: any) {
      this.error = parseError(e);
    }
  };

  submit = async (name: string, password: string) => {
    let key: KeyStoreEntry | undefined;

    try {
      this.inProcess = true;

      if (this.seed === null) {
        throw Error('Seed must be specified');
      }

      key = await this.rpcStore.rpc.createMasterKey({
        password,
        seed: this.seed,
        select: true,
      });

      await this.rpcStore.rpc.createAccount({
        name,
        contractType: this.contractType,
        publicKey: key.publicKey,
        workchain: 0,
      });
    } catch (e: any) {
      if (key) {
        await this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error);
      }

      runInAction(() => {
        this.error = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.inProcess = false;
      });
    }
  };

  getBip39Hints = this.nekoton.getBip39Hints;
}

export enum Step {
  SelectContractType,
  EnterPhrase,
  EnterPassword,
}
