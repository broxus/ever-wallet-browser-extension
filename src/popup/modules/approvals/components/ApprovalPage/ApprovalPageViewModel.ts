import { Approval } from '@app/models';
import { RpcStore } from '@app/popup/modules/shared';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';
import { ApprovalStore } from '../../store';

@injectable()
export class ApprovalPageViewModel {
  constructor(
    private rpcStore: RpcStore,
    private approvalStore: ApprovalStore,
  ) {
    makeAutoObservable<ApprovalPageViewModel, any>(this, {
      rpcStore: false,
      approvalStore: false,
    });
  }

  get approvalIndex(): number {
    return this.approvalStore.approvalIndex;
  }

  get pendingApprovals(): Approval<string, unknown>[] {
    return this.approvalStore.pendingApprovals;
  }

  get approval(): Approval<string, unknown> {
    return this.approvalStore.approval;
  }

  decrementIndex = () => this.approvalStore.decrementIndex();

  incrementIndex = () => this.approvalStore.incrementIndex();
}
