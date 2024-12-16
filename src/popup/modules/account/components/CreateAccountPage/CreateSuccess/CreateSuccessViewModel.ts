import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { AccountabilityStore, NekotonToken } from '@app/popup/modules/shared'
import { type Nekoton } from '@app/models'
import { CreateAccountStore } from '@app/popup/modules/account/components/CreateAccountPage/CreateAccountStore'

@injectable()
export class CreateSuccessViewModel {

    public loading = false

    constructor(
        private accountability: AccountabilityStore,
        @inject(NekotonToken) private nekoton: Nekoton,
        private createAccount: CreateAccountStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    close() {
        window.close()
    }

    async switch(): Promise<void> {
        if (this.loading) return
        this.loading = true
        if (this.createAccount.account) {
            await this.accountability.selectAccount(this.createAccount.account.tonWallet.address)
        }
        window.close()
    }

}
