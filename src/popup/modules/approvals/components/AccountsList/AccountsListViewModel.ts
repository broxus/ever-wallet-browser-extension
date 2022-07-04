import { AccountabilityStore } from '@app/popup/modules/shared';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class AccountsListViewModel {
  constructor(private accountability: AccountabilityStore) {
    makeAutoObservable<AccountsListViewModel, any>(this, {
      accountability: false,
    });
  }

  get accountEntries(): Record<string, nt.AssetsList> {
    return this.accountability.accountEntries;
  }

  get accountContractStates(): Record<string, nt.ContractState> {
    return this.accountability.accountContractStates;
  }
}
