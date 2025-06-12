import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { NekotonToken } from '@app/popup/modules/shared'

@injectable()
export class DataConverter {

    constructor(@inject(NekotonToken) private nekoton: Nekoton) {
    }

    convert(data: string, type: DisplayType) {
        switch (type) {
            case DisplayType.Hex:
                return this.base64ToHex(data)

            case DisplayType.Utf8:
                return this.base64ToUtf8(data)

            case DisplayType.Hash:
                return this.base64ToHash(data)

            default:
                return data
        }
    }

    private base64ToUtf8 = (str: string) => {
        try {
            return this.nekoton.base64ToUtf8Lossy(str)
        }
        catch (e: any) {
            return str
        }
    }

    private base64ToHex = (bytes: string) => atob(bytes)
        .split('')
        .map(c => (`0${c.charCodeAt(0).toString(16)}`).slice(-2))
        .join('')

    private base64ToHash = (bytes: string) => this.nekoton.getDataHash(bytes)

}

export enum DisplayType {
    Utf8 = 'utf8',
    Hex = 'hex',
    Base64 = 'base64',
    Hash = 'hash',
}
