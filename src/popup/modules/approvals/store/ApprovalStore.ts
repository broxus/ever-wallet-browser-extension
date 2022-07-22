import { Approval, NekotonRpcError, RpcErrorCode } from '@app/models';
import { serializeError } from '@app/shared';
import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';
import { StandaloneStore } from './StandaloneStore';

@singleton()
export class ApprovalStore {
  private _approvalIndex = 0;

  constructor(private standaloneStore: StandaloneStore) {
    makeAutoObservable<ApprovalStore, any>(this, {
      rpcStore: false,
    });
  }

  get approvalIndex(): number {
    return Math.min(this.pendingApprovals.length - 1, this._approvalIndex);
  }

  set approvalIndex(value: number) {
    this._approvalIndex = value;
  }

  get pendingApprovals(): Approval<string, unknown>[] {
    return Object.values(this.standaloneStore.state.pendingApprovals);
  }

  get approval(): Approval<string, unknown> {
    return this.pendingApprovals[this.approvalIndex];
  }

  get pendingApprovalCount(): number {
    return this.standaloneStore.state.pendingApprovalCount;
  }

  decrementIndex = () => {
    this.approvalIndex = (this.approvalIndex + this.pendingApprovals.length - 1) % this.pendingApprovals.length;
  };

  incrementIndex = () => {
    this.approvalIndex = (this.approvalIndex + 1) % this.pendingApprovals.length;
  };

  resolvePendingApproval = async (value: unknown, delayedDeletion: boolean = false) => {
    await this.standaloneStore.rpc.resolvePendingApproval(this.approval.id, value, delayedDeletion);
  };

  rejectPendingApproval = async () => {
    await this.standaloneStore.rpc.rejectPendingApproval(this.approval.id, rejectedByUser as any);
  };
}

const rejectedByUser = serializeError(
  new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, 'Rejected by user'),
);
