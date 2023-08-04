import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { Router } from '@app/popup/modules/shared'

import { DeployStore, MultisigData } from '../../store'

@injectable()
export class DeployMultisigWalletViewModel {

    constructor(
        private store: DeployStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get contractType(): nt.ContractType | undefined {
        return this.store.account?.tonWallet.contractType
    }

    public get multisigData(): MultisigData | undefined {
        return this.store.multisigData
    }

    public async submit(data: MultisigData): Promise<void> {
        await this.store.submitMultisigData(data)
        await this.router.navigate('/confirm')
    }

}
