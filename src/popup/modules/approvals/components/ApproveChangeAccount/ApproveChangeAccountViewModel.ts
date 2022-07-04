import { PendingApproval } from '@app/models';
import { AccountabilityStore, createEnumField } from '@app/popup/modules/shared';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';
import { ApprovalStore } from '../../store';

@injectable()
export class ApproveChangeAccountViewModel {
  step = createEnumField(Step, Step.SelectAccount);
  selectedAccount = this.accountability.selectedAccount;

  constructor(
    private approvalStore: ApprovalStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<ApproveChangeAccountViewModel, any>(this, {
      approvalStore: false,
      accountability: false,
    });
  }

  get approval() {
    return this.approvalStore.approval as PendingApproval<'changeAccount'>;
  }

  setSelectedAccount = (account: nt.AssetsList | undefined) => {
    this.selectedAccount = account;
  };

  onSubmit = async () => {
    this.step.setConnecting();

    if (this.selectedAccount) {
      await this.approvalStore.resolvePendingApproval({
        address: this.selectedAccount.tonWallet.address,
        publicKey: this.selectedAccount.tonWallet.publicKey,
        contractType: this.selectedAccount.tonWallet.contractType,
      });
    }
  };
}

export enum Step {
  SelectAccount,
  Connecting,
}
