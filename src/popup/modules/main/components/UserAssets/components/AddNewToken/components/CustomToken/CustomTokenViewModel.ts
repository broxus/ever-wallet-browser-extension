import { inject, injectable } from 'tsyringe'

import { Nekoton } from '@app/models'
import { NekotonToken } from '@app/popup/modules/shared'

@injectable()
export class CustomTokenViewModel {

    constructor(@inject(NekotonToken) private nekoton: Nekoton) {
    }

    checkAddress(value: string): boolean {
        return this.nekoton.checkAddress(value)
    }

}
