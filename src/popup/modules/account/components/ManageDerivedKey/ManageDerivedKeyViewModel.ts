import { AccountabilityStep, AccountabilityStore, RpcStore } from '@app/popup/modules/shared';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable } from 'mobx';
import { ChangeEvent } from 'react';
import { injectable } from 'tsyringe';

@injectable()
export class ManageDerivedKeyViewModel {
  name = this.accountability.currentDerivedKey?.name ?? '';

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<ManageDerivedKeyViewModel, any>(this, {
      accountability: false,
    });
  }

  get currentDerivedKey(): nt.KeyStoreEntry | undefined {
    return this.accountability.currentDerivedKey;
  }

  get currentDerivedKeyAccounts(): nt.AssetsList[] {
    return this.accountability.currentDerivedKeyAccounts;
  }

  get accountsVisibility(): Record<string, boolean> {
    return this.accountability.accountsVisibility;
  }

  get selectedAccountAddress(): string | undefined {
    return this.accountability.selectedAccountAddress;
  }

  get currentDerivedKeyExternalAccounts(): nt.AssetsList[] {
    return this.accountability.currentDerivedKeyExternalAccounts;
  }

  get isSaveVisible(): boolean {
    return !!this.currentDerivedKey &&
      !!(this.currentDerivedKey.name || this.name) &&
      this.currentDerivedKey.name !== this.name;
  }

  onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.name = e.target.value;
  };

  addAccount = () => this.accountability.setStep(AccountabilityStep.CREATE_ACCOUNT);

  saveName = async () => {
    if (this.currentDerivedKey && this.name) {
      await this.rpcStore.rpc.updateDerivedKeyName({
        ...this.currentDerivedKey,
        name: this.name,
      });

      this.accountability.setCurrentDerivedKey({
        ...this.currentDerivedKey,
        name: this.name,
      });
    }
  };

  onManageAccount = (account: nt.AssetsList) => this.accountability.onManageAccount(account);

  onBack = () => {
    this.accountability.setStep(AccountabilityStep.MANAGE_SEED);
    this.accountability.setCurrentDerivedKey(undefined);
  };
}
