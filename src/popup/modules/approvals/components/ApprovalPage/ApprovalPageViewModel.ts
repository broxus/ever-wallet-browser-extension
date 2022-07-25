import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Approval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApprovalPageViewModel {

    constructor(private approvalStore: ApprovalStore) {
        makeAutoObservable<ApprovalPageViewModel, any>(this, {
            approvalStore: false,
        }, { autoBind: true })
    }

    public get approvalIndex(): number {
        return this.approvalStore.approvalIndex
    }

    public get pendingApprovals(): Approval<string, unknown>[] {
        return this.approvalStore.pendingApprovals
    }

    public get approval(): Approval<string, unknown> {
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
