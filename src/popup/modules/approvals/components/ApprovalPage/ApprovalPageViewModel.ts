import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import type { Approval } from '@app/models'
import { ConnectionStore } from '@app/popup/modules/shared'

import { ApprovalStore } from '../../store'

@injectable()
export class ApprovalPageViewModel {

    constructor(
        private approvalStore: ApprovalStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
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

    public get connectionName(): string {
        return this.connectionStore.selectedConnection.name
    }

    public decrementIndex(): void {
        this.approvalStore.decrementIndex()
    }

    public incrementIndex(): void {
        this.approvalStore.incrementIndex()
    }

}
