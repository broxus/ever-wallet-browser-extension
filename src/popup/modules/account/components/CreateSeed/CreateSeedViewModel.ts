import { Nekoton } from '@app/models';
import {
  AccountabilityStep,
  AccountabilityStore,
  createEnumField,
  NekotonToken,
  RpcStore,
} from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { ChangeEvent } from 'react';
import { inject, injectable } from 'tsyringe';

@injectable()
export class CreateSeedViewModel {
  name: string | undefined;
  inProcess = false;
  error = '';
  flow = AddSeedFlow.Create;
  step = createEnumField(Step, Step.Index);

  private _seed: nt.GeneratedMnemonic | null = null;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<CreateSeedViewModel, any>(this, {
      nekoton: false,
      rpcStore: false,
      accountability: false,
    });
  }

  get seed(): nt.GeneratedMnemonic {
    if (!this._seed) {
      this._seed = this.nekoton.generateMnemonic(
        this.nekoton.makeLabsMnemonic(0),
      );
    }

    return this._seed;
  }

  get seedWords(): string[] {
    return this.seed.phrase.split(' ');
  }

  onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.name = e.target.value;
  };

  onFlowChange = (value: AddSeedFlow) => {
    this.flow = value;
  };

  onSubmit = async (password: string) => {
    this.inProcess = true;

    try {
      let nameToSave = this.name?.trim();
      if (nameToSave?.length === 0) {
        nameToSave = undefined;
      }

      const entry = await this.rpcStore.rpc.createMasterKey({
        select: false,
        seed: this.seed,
        name: nameToSave,
        password,
      });

      console.log(entry);
      if (entry) {
        this.accountability.onManageMasterKey(entry);
        this.accountability.onManageDerivedKey(entry);
      }
    } catch (e: any) {
      runInAction(() => {
        this.error = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.inProcess = false;
      });
    }
  };

  onNext = () => {
    switch (this.step.value) {
      case Step.ShowPhrase:
        this.step.setCheckPhrase();
        break;

      case Step.CheckPhrase:
        this.step.setPasswordRequest();
        break;

      default:
        if (this.flow === AddSeedFlow.Create) {
          this.step.setShowPhrase();
        } else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
          this.step.setImportPhrase();
        } else if (this.flow === AddSeedFlow.ConnectLedger) {
          this.step.setConnectLedger();
        }
    }
  };

  onNextWhenImport = (words: string[]) => {
    const phrase = words.join(' ');
    const mnemonicType: nt.MnemonicType = this.flow === AddSeedFlow.ImportLegacy ?
      { type: 'legacy' } :
      { type: 'labs', accountId: 0 };

    try {
      this.nekoton.validateMnemonic(phrase, mnemonicType);
      this._seed = { phrase, mnemonicType };
      this.step.setPasswordRequest();
    } catch (e: any) {
      this.error = parseError(e);
    }
  };

  onBack = () => {
    this.error = '';

    switch (this.step.value) {
      case Step.ShowPhrase:
      case Step.ImportPhrase:
        this.step.setIndex();
        break;

      case Step.CheckPhrase:
        this.step.setShowPhrase();
        break;

      case Step.PasswordRequest:
        if (this.flow === AddSeedFlow.Create) {
          this.step.setShowPhrase();
        } else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
          this.step.setImportPhrase();
        } else if (this.flow === AddSeedFlow.ConnectLedger) {
          this.step.setConnectLedger();
        }
        break;

      default:
        this.accountability.setStep(AccountabilityStep.MANAGE_SEEDS);
        break;
    }
  };

  getBip39Hints = this.nekoton.getBip39Hints;
}

export enum AddSeedFlow {
  Create,
  Import,
  ImportLegacy,
  ConnectLedger,
}

export enum Step {
  Index,
  ShowPhrase,
  CheckPhrase,
  PasswordRequest,
  ImportPhrase,
  ConnectLedger,
}

export interface OptionType {
  key: AddSeedFlow;
  value: AddSeedFlow;
  label: string;
}
