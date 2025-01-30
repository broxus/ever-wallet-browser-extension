import { Address } from '@ton/core'

export const parseTonAddress = (value: string): string | null => {
    try {
        return Address.parseFriendly(value).address.toRawString()
    }
    catch (e) {
        console.warn(e)
    }
    return null
}
