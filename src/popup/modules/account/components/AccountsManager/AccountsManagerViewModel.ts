import { AccountabilityStep, AccountabilityStore } from '@app/popup/modules/shared';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class AccountsManagerViewModel {
  constructor(
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<AccountsManagerViewModel, any>(this, {
      accountability: false,
    });
  }

  get signerName(): 'master_key' | 'encrypted_key' | 'ledger_key' | undefined {
    return this.accountability.currentMasterKey?.signerName;
  }

  get step(): AccountabilityStep {
    return this.accountability.step;
  }

  onBackInCreateAccountIndex = () => {
    this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY);
  };

  backToManageSeed = () => {
    this.accountability.setStep(AccountabilityStep.MANAGE_SEED);
  };
}
