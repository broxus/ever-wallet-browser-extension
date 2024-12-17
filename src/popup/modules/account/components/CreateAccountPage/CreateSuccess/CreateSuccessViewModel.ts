import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { AccountabilityStore, NekotonToken } from '@app/popup/modules/shared'
import { type Nekoton } from '@app/models'

@injectable()
export class CreateSuccessViewModel {

    public loading = false

    constructor(
        private accountability: AccountabilityStore,
        @inject(NekotonToken) private nekoton: Nekoton,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    close() {
        window.close()
    }

    async switch(address: string): Promise<void> {
        if (this.loading) return
        this.loading = true
        await this.accountability.selectAccount(address)
        window.close()
    }

}
