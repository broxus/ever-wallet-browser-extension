import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, createEnumField } from '@app/popup/modules/shared'
import { PendingApproval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveChangeAccountViewModel {

    public step = createEnumField(Step, Step.SelectAccount)

    public selectedAccount = this.accountability.selectedAccount

    constructor(
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<ApproveChangeAccountViewModel, any>(this, {
            approvalStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get approval(): PendingApproval<'changeAccount'> {
        return this.approvalStore.approval as PendingApproval<'changeAccount'>
    }

    public setSelectedAccount(account: nt.AssetsList | undefined): void {
        this.selectedAccount = account
    }

    public async onSubmit(): Promise<void> {
        this.step.setConnecting()

        if (this.selectedAccount) {
            await this.approvalStore.resolvePendingApproval({
                address: this.selectedAccount.tonWallet.address,
                publicKey: this.selectedAccount.tonWallet.publicKey,
                contractType: this.selectedAccount.tonWallet.contractType,
            })
        }
    }

}

export enum Step {
    SelectAccount,
    Connecting,
}
