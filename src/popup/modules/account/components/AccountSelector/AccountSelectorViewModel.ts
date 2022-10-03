import { inject, singleton } from 'tsyringe'

import { Nekoton } from '@app/models'
import { NekotonToken } from '@app/popup/modules/shared'

@singleton()
export class AccountSelectorViewModel {

    constructor(@inject(NekotonToken) private nekoton: Nekoton) {
    }

    public computeEverWalletAddress(publicKey: string): string {
        return this.nekoton.computeTonWalletAddress(publicKey, 'SafeMultisigWallet', 0)
    }

}
