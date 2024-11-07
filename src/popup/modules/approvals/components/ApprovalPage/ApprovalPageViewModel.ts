import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import type { Approval, ApprovalType } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApprovalPageViewModel {

    constructor(private approvalStore: ApprovalStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get approvalIndex(): number {
        return this.approvalStore.approvalIndex
    }

    public get pendingApprovals(): Approval<ApprovalType, unknown>[] {
        return this.approvalStore.pendingApprovals
    }

    public get approval(): Approval<ApprovalType, unknown> {
        return this.approvalStore.approval
    }

    public get pendingApprovalCount(): number {
        return this.approvalStore.pendingApprovalCount
    }

    public decrementIndex(): void {
        this.approvalStore.decrementIndex()
    }

    public incrementIndex(): void {
        this.approvalStore.incrementIndex()
    }

}
