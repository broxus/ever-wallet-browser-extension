/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { type SignDataRequestPayloadBinary, type SignDataRequestPayloadCell, type SignDataRequestPayloadText } from '@app/models'

import { bytesToBase64, parseFriendlyAddress, sha256, crc16 } from '../utils'

/**
 * Creates hash for text or binary payload.
 * Message format:
 * message = 0xffff ++ "ton-connect/sign-data/" ++ workchain ++ address_hash ++ domain_len ++ domain ++ timestamp ++ payload
 * finalMessage = 0xffff || "ton-connect" || sha256(message)
 */
export async function createTextBinaryHash(
    payload: SignDataRequestPayloadText | SignDataRequestPayloadBinary,
    addr: string,
    domain: string,
    timestamp: number,
): Promise<string> {
    const address = parseFriendlyAddress(addr)
    // Create workchain buffer
    const wcBuffer = Buffer.alloc(4)
    wcBuffer.writeInt32BE(address.workchain)

    // Create domain buffer
    const domainBuffer = Buffer.from(domain, 'utf8')
    const domainLenBuffer = Buffer.alloc(4)
    domainLenBuffer.writeUInt32BE(domainBuffer.length)

    // Create timestamp buffer
    const tsBuffer = Buffer.alloc(8)
    tsBuffer.writeBigUInt64BE(BigInt(timestamp))

    // Create payload buffer
    const typePrefix = payload.type === 'text' ? 'txt' : 'bin'
    const content = payload.type === 'text' ? payload.text : payload.bytes
    const encoding = payload.type === 'text' ? 'utf8' : 'base64'

    const payloadPrefix = Buffer.from(typePrefix)
    const payloadBuffer = Buffer.from(content, encoding)
    const payloadLenBuffer = Buffer.alloc(4)
    payloadLenBuffer.writeUInt32BE(payloadBuffer.length)

    const message = Buffer.concat([
        Buffer.from([0xff, 0xff]),
        Buffer.from('ton-connect/sign-data/'),
        wcBuffer,
        Buffer.from(new Uint8Array(address.hashPart)),
        domainLenBuffer,
        domainBuffer,
        tsBuffer,
        payloadPrefix,
        payloadLenBuffer,
        payloadBuffer,
    ] as any)

    const hashBytes = new Uint8Array(await sha256(new Uint8Array(message)))
    return bytesToBase64(hashBytes)
}

/**
 * Creates hash for Cell payload according to TON Connect specification.
 */
export async function createCellHash(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: SignDataRequestPayloadCell,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    domain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    timestamp: number,
): Promise<any> {
    // const cell = Cell.fromBase64(payload.cell)
    // const schemaHash = crc32.buf(Buffer.from(payload.schema, 'utf8')) >>> 0 // unsigned crc32 hash

    // const encodedDnsName = encodeDnsName(domain).toString('utf8')

    // const message = beginCell()
    //     .storeUint(0x75569022, 32) // prefix
    //     .storeUint(schemaHash, 32) // schema hash
    //     .storeUint(timestamp, 64) // timestamp
    //     .storeAddress(parsedAddr) // user wallet address
    //     .storeStringRefTail(encodedDnsName) // app domain
    //     .storeRef(cell) // payload cell
    //     .endCell()

    // return Buffer.from(message.hash())
}


// look up tables
const to_hex_array: any = []
const to_byte_map: any = {}
for (let ord = 0; ord <= 0xff; ord++) {
    let s = ord.toString(16)
    if (s.length < 2) {
        s = `0${s}`
    }
    to_hex_array.push(s)
    to_byte_map[s] = ord
}
function bytesToHex(buffer: Uint8Array) {
    const hex_array = []
    for (let i = 0; i < buffer.byteLength; i++) {
        hex_array.push(to_hex_array[buffer[i]])
    }
    return hex_array.join('')
}

export function stringToBase64(s: string) {
    if (typeof self === 'undefined') {
        return Buffer.from(s, 'binary').toString('base64')
    }
    return btoa(s)
}

export function hexToBytes(s: string) {
    s = s.toLowerCase()
    const length2 = s.length
    if (length2 % 2 !== 0) {
        throw new Error('hex string must have length a multiple of 2')
    }
    const length = length2 / 2
    const result = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
        const i2 = i * 2
        const b = s.substring(i2, i2 + 2)
        // eslint-disable-next-line no-prototype-builtins
        if (!to_byte_map.hasOwnProperty(b)) throw new Error(`invalid hex character ${b}`)
        result[i] = to_byte_map[b]
    }
    return result
}


const bounceable_tag = 0x11
const non_bounceable_tag = 0x51
const test_flag = 0x80

type AddressInput = string | TonAddress

export class TonAddress {

    wc!: number

    hashPart!: Uint8Array

    isTestOnly!: boolean

    isUserFriendly!: boolean

    isBounceable!: boolean

    isUrlSafe!: boolean

    /**
     * Проверяет валидность адреса
     */
    static isValid(anyForm: AddressInput): boolean {
        try {
            // eslint-disable-next-line no-new
            new TonAddress(anyForm)
            return true
        }
        catch (e) {
            return false
        }
    }

    /**
     * Конструктор TonAddress
     * @param anyForm {string | TonAddress}
     */
    constructor(anyForm: string | TonAddress) {
        if (anyForm == null) {
            throw new Error('Invalid address')
        }

        if (anyForm instanceof TonAddress) {
            this.wc = anyForm.wc
            this.hashPart = anyForm.hashPart
            this.isTestOnly = anyForm.isTestOnly
            this.isUserFriendly = anyForm.isUserFriendly
            this.isBounceable = anyForm.isBounceable
            this.isUrlSafe = anyForm.isUrlSafe
            return
        }

        this.isUrlSafe = true

        if (anyForm.includes('-') || anyForm.includes('_')) {
            anyForm = anyForm.replace(/-/g, '+').replace(/_/g, '/')
        }
        else {
            this.isUrlSafe = false
        }

        if (anyForm.includes(':')) {
            const arr = anyForm.split(':')
            if (arr.length !== 2) throw new Error(`Invalid address ${anyForm}`)
            const wc = parseInt(arr[0], 10)
            if (wc !== 0 && wc !== -1) throw new Error(`Invalid address wc ${anyForm}`)
            const hex = arr[1]
            if (hex.length !== 64) throw new Error(`Invalid address hex ${anyForm}`)
            this.isUserFriendly = false
            this.wc = wc
            this.hashPart = hexToBytes(hex)
            this.isBounceable = false
        }
        else {
            this.isUserFriendly = true
            const parseResult = parseFriendlyAddress(anyForm)
            this.wc = parseResult.workchain
            this.hashPart = parseResult.hashPart
            this.isBounceable = parseResult.isBounceable
        }
    }

    /**
     * Преобразует адрес в строку
     * @param isUserFriendly? {boolean}
     * @param isUrlSafe? {boolean}
     * @param isBounceable? {boolean}
     * @param isTestOnly? {boolean}
     * @returns {string}
     */
    toString(
        isUserFriendly?: boolean,
        isUrlSafe?: boolean,
        isBounceable?: boolean,
        isTestOnly?: boolean,
    ): string {
        if (isUserFriendly === undefined) isUserFriendly = this.isUserFriendly
        if (isUrlSafe === undefined) isUrlSafe = this.isUrlSafe
        if (isBounceable === undefined) isBounceable = this.isBounceable
        if (isTestOnly === undefined) isTestOnly = this.isTestOnly

        if (!isUserFriendly) {
            return `${this.wc}:${bytesToHex(this.hashPart)}`
        }

        let tag = isBounceable ? bounceable_tag : non_bounceable_tag
        // eslint-disable-next-line no-bitwise
        if (isTestOnly) tag |= test_flag

        const addr = new Uint8Array(34)
        addr[0] = tag
        addr[1] = this.wc
        addr.set(this.hashPart, 2)

        const addressWithChecksum = new Uint8Array(36)
        addressWithChecksum.set(addr)
        addressWithChecksum.set(crc16(addr), 34)

        let addressBase64 = stringToBase64(
            String.fromCharCode.apply(null, Array.from(addressWithChecksum)),
        )

        if (isUrlSafe) {
            addressBase64 = addressBase64.replace(/\+/g, '-').replace(/\//g, '_')
        }

        return addressBase64
    }

}
