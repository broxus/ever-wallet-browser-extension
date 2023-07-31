import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { NekotonToken } from '@app/popup/modules/shared'

@injectable()
export class CustomTokenViewModel {

    constructor(@inject(NekotonToken) private nekoton: Nekoton) {
    }

    public checkAddress(value: string): boolean {
        return this.nekoton.checkAddress(value)
    }

}
