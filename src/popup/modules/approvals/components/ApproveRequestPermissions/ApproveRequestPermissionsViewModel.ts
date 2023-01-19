import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, when } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, createEnumField, RpcStore } from '@app/popup/modules/shared'
import { ApprovalOutput, PendingApproval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveRequestPermissionsViewModel {

    public step = createEnumField<typeof Step>(this.shouldSelectAccount ? Step.SelectAccount : Step.Confirm)

    public confirmChecked = true

    public selectedAccount = this.accountability.selectedAccount

    constructor(
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        when(
            () => Object.keys(this.accountability.accounts).length !== 0,
            () => this.rpcStore.rpc.updateContractState(Object.keys(this.accountability.accountEntries)),
        )
    }

    public get approval(): PendingApproval<'requestPermissions'> {
        return this.approvalStore.approval as PendingApproval<'requestPermissions'>
    }

    public get shouldSelectAccount() {
        return this.approval.requestData.permissions.includes('accountInteraction')
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.accountability.accountContractStates
    }

    public get permissions(): string {
        return JSON.stringify(this.approval.requestData.permissions, undefined, 4)
    }

    public get balance(): string {
        return (this.selectedAccount && this.accountContractStates[this.selectedAccount.tonWallet.address]?.balance) ?? '0'
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public setSelectedAccount(account: nt.AssetsList | undefined): void {
        this.selectedAccount = account
    }

    public setConfirmChecked(checked: boolean): void {
        this.confirmChecked = checked
    }

    public async onSubmit(): Promise<void> {
        this.step.setValue(Step.Connecting)

        const originPermissions: ApprovalOutput<'requestPermissions'> = {}

        if (this.shouldSelectAccount && this.selectedAccount) {
            originPermissions.accountInteraction = {
                address: this.selectedAccount.tonWallet.address,
                publicKey: this.selectedAccount.tonWallet.publicKey,
                // @ts-ignore // TODO: update inpage-provider
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
