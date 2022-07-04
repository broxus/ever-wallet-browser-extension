import { Approval, NekotonRpcError, RpcErrorCode } from '@app/models';
import { RpcStore } from '@app/popup/modules/shared';
import { serializeError } from '@app/shared';
import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

@singleton()
export class ApprovalStore {
  private _approvalIndex = 0;

  constructor(private rpcStore: RpcStore) {
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
    return Object.values(this.rpcStore.state.pendingApprovals);
  }

  get approval(): Approval<string, unknown> {
    return this.pendingApprovals[this.approvalIndex];
  }

  decrementIndex = () => {
    this.approvalIndex = (this.approvalIndex + this.pendingApprovals.length - 1) % this.pendingApprovals.length;
  };

  incrementIndex = () => {
    this.approvalIndex = (this.approvalIndex + 1) % this.pendingApprovals.length;
  };

  resolvePendingApproval = async (value: unknown, delayedDeletion: boolean = false) => {
    await this.rpcStore.rpc.resolvePendingApproval(this.approval.id, value, delayedDeletion);
  };

  rejectPendingApproval = async () => {
    await this.rpcStore.rpc.rejectPendingApproval(this.approval.id, rejectedByUser as any);
  };
}

const rejectedByUser = serializeError(
  new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, 'Rejected by user'),
);
