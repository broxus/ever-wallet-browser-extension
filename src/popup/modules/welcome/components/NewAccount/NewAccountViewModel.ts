import { Nekoton } from '@app/models';
import { createEnumField, NekotonToken, RpcStore } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import { DEFAULT_CONTRACT_TYPE, Logger } from '@app/shared';
import { action, makeObservable, observable, runInAction } from 'mobx';
import type { ContractType, GeneratedMnemonic, KeyStoreEntry } from 'nekoton-wasm';
import { inject, injectable } from 'tsyringe';

@injectable()
export class NewAccountViewModel {
  step = createEnumField(Step, Step.SelectContractType);
  contractType = DEFAULT_CONTRACT_TYPE;
  inProcess = false;
  error: string | undefined;

  private _seed: GeneratedMnemonic | null = null;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private logger: Logger,
  ) {
    makeObservable(this, {
      contractType: observable,
      inProcess: observable,
      error: observable,
      setContractType: action,
      submit: action,
      resetError: action,
    });
  }

  get seed(): GeneratedMnemonic {
    if (!this._seed) {
      this._seed = this.nekoton.generateMnemonic(
        this.nekoton.makeLabsMnemonic(0),
      );
    }

    return this._seed;
  }

  setContractType = (type: ContractType) => {
    this.contractType = type;
    this.step.setShowPhrase();
  };

  resetError = () => {
    this.error = undefined;
  };

  submit = async (name: string, password: string) => {
    let key: KeyStoreEntry | undefined;

    try {
      this.inProcess = true;

      key = await this.rpcStore.rpc.createMasterKey({
        password,
        seed: this.seed,
        select: true,
      });

      await this.rpcStore.rpc.createAccount({
        name,
        publicKey: key.publicKey,
        contractType: this.contractType,
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
}

export enum Step {
  SelectContractType,
  ShowPhrase,
  CheckPhrase,
  EnterPassword,
}
