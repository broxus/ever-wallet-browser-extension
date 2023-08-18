import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import { AccountabilityStore, NotificationStore } from '@app/popup/modules/shared'
import { PendingApproval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveChangeAccountViewModel {

    public selectedAccount = this.accountability.selectedAccount

    public loading = false

    constructor(
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get approval(): PendingApproval<'changeAccount'> {
        return this.approvalStore.approval as PendingApproval<'changeAccount'>
    }

    public setSelectedAccount(account: nt.AssetsList | undefined): void {
        this.selectedAccount = account
    }

    public async onSubmit(): Promise<void> {
        if (this.loading || !this.selectedAccount) return
        this.loading = true

        try {
            await this.approvalStore.resolvePendingApproval({
                address: this.selectedAccount.tonWallet.address,
                publicKey: this.selectedAccount.tonWallet.publicKey,
                contractType: this.selectedAccount.tonWallet.contractType,
            })
        }
        catch (e) {
            this.notification.error(parseError(e))
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
