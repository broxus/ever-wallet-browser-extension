import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { closeCurrentWindow } from '@app/shared'
import { AccountabilityStep, AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class AccountsManagerViewModel {

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.rpcStore.rpc.tempStorageRemove('manage_seeds').then((value: any) => {
            if (value?.step === 'create_seed') {
                this.accountability.setStep(AccountabilityStep.CREATE_SEED)
            }
        })
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
