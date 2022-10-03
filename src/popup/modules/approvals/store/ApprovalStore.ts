import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'

import { Approval, NekotonRpcError, RpcErrorCode } from '@app/models'
import { serializeError } from '@app/shared'

import { StandaloneStore } from './StandaloneStore'

@singleton()
export class ApprovalStore {

    private _approvalIndex = 0

    constructor(private standaloneStore: StandaloneStore) {
        makeAutoObservable<ApprovalStore, any>(this, {
            standaloneStore: false,
        }, { autoBind: true })
    }

    public get approvalIndex(): number {
        return Math.min(this.pendingApprovals.length - 1, this._approvalIndex)
    }

    public set approvalIndex(value: number) {
        this._approvalIndex = value
    }

    public get pendingApprovals(): Approval<string, unknown>[] {
        return Object.values(this.standaloneStore.state.pendingApprovals)
    }

    public get approval(): Approval<string, unknown> {
        return this.pendingApprovals[this.approvalIndex]
    }

    public get pendingApprovalCount(): number {
        return this.standaloneStore.state.pendingApprovalCount
    }

    decrementIndex(): void {
        this.approvalIndex = (this.approvalIndex + this.pendingApprovals.length - 1) % this.pendingApprovals.length
    }

    incrementIndex(): void {
        this.approvalIndex = (this.approvalIndex + 1) % this.pendingApprovals.length
    }

    async resolvePendingApproval(value: unknown, delayedDeletion: boolean = false): Promise<void> {
        await this.standaloneStore.rpc.resolvePendingApproval(this.approval.id, value, delayedDeletion)
    }

    async rejectPendingApproval(): Promise<void> {
        await this.standaloneStore.rpc.rejectPendingApproval(this.approval.id, rejectedByUser as any)
    }

}

const rejectedByUser = serializeError(
    new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, 'Rejected by user'),
)
