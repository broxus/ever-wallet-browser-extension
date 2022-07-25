import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Approval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApprovalPageViewModel {

    constructor(private approvalStore: ApprovalStore) {
        makeAutoObservable<ApprovalPageViewModel, any>(this, {
            approvalStore: false,
        })
    }

    get approvalIndex(): number {
        return this.approvalStore.approvalIndex
    }

    get pendingApprovals(): Approval<string, unknown>[] {
        return this.approvalStore.pendingApprovals
    }

    get approval(): Approval<string, unknown> {
        return this.approvalStore.approval
    }

    get pendingApprovalCount(): number {
        return this.approvalStore.pendingApprovalCount
    }

    decrementIndex = () => this.approvalStore.decrementIndex()

    incrementIndex = () => this.approvalStore.incrementIndex()

}
