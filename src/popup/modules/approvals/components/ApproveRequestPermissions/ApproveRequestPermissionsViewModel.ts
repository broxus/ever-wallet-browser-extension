import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, createEnumField } from '@app/popup/modules/shared'
import { ApprovalOutput, PendingApproval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveRequestPermissionsViewModel {

    step = createEnumField(Step, this.shouldSelectAccount ? Step.SelectAccount : Step.Confirm)

    confirmChecked = true

    selectedAccount = this.accountability.selectedAccount

    constructor(
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<ApproveRequestPermissionsViewModel, any>(this, {
            approvalStore: false,
            accountability: false,
        })
    }

    get approval() {
        return this.approvalStore.approval as PendingApproval<'requestPermissions'>
    }

    get shouldSelectAccount() {
        return this.approval.requestData.permissions.includes('accountInteraction')
    }

    get accountContractStates(): Record<string, nt.ContractState> {
        return this.accountability.accountContractStates
    }

    get permissions(): string {
        return JSON.stringify(this.approval.requestData.permissions, undefined, 4)
    }

    get balance(): string {
        return (this.selectedAccount && this.accountContractStates[this.selectedAccount.tonWallet.address]?.balance) ?? '0'
    }

    setSelectedAccount = (account: nt.AssetsList | undefined) => {
        this.selectedAccount = account
    }

    setConfirmChecked = (checked: boolean) => {
        this.confirmChecked = checked
    }

    onSubmit = async () => {
        this.step.setConnecting()

        const originPermissions: ApprovalOutput<'requestPermissions'> = {}

        if (this.shouldSelectAccount && this.selectedAccount) {
            originPermissions.accountInteraction = {
                address: this.selectedAccount.tonWallet.address,
                publicKey: this.selectedAccount.tonWallet.publicKey,
                contractType: this.selectedAccount.tonWallet.contractType,
            }
        }

        if (this.approval.requestData.permissions.includes('basic')) {
            originPermissions.basic = true
        }

        await this.approvalStore.resolvePendingApproval(originPermissions)
    }

}

export enum Step {
    SelectAccount,
    Confirm,
    Connecting,
}
