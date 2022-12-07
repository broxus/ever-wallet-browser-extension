import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { closeCurrentWindow } from '@app/shared'
import { AccountabilityStep, AccountabilityStore } from '@app/popup/modules/shared'

@injectable()
export class AccountsManagerViewModel {

    constructor(
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<AccountsManagerViewModel, any>(this, {
            accountability: false,
        }, { autoBind: true })
    }

    public get signerName(): 'master_key' | 'encrypted_key' | 'ledger_key' | undefined {
        return this.accountability.currentMasterKey?.signerName
    }

    public get step(): AccountabilityStep {
        return this.accountability.step
    }

    public onBackInCreateAccountIndex(): void {
        this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY)
    }

    public backToManageSeed(): void {
        this.accountability.setStep(AccountabilityStep.MANAGE_SEED)
    }

    public async close(): Promise<void> {
        await closeCurrentWindow()
    }

}
