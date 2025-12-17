import safeStringify from 'fast-safe-stringify'

import { type TON_CONNECT_EVENT_ERROR_CODES, type TON_DISCONNECT_ERROR_CODES, TON_SEND_TRANSACTION_ERROR_CODES, type TON_SIGN_DATA_ERROR_CODES, type TonWalletResponseError } from '@app/models/background'

import { RpcErrorCode } from '../errors'
import type { JsonRpcError } from '../utils'


type ErrorCodeByMethod = {
    disconnect: TON_DISCONNECT_ERROR_CODES;
    sendTransaction: TON_SEND_TRANSACTION_ERROR_CODES;
    signData: TON_SIGN_DATA_ERROR_CODES;
    connect: TON_CONNECT_EVENT_ERROR_CODES;
}

type EnumValues<T> = T extends Record<string, number> ? T[keyof T] : never
type ErrorCodeValuesByMethod = {
    [K in keyof ErrorCodeByMethod]: EnumValues<ErrorCodeByMethod[K]>;
  }


type WalletErrorOptions = {
    id: number | string;
    message: string;
    code?: number;
    data?: unknown;
}

export function createWalletError<T extends keyof ErrorCodeValuesByMethod>(
    _method: T,
    options: WalletErrorOptions,
): TonWalletResponseError<T> {
    return {
        id: options.id,
        error: {
            code: (options.code ?? 0),
            message: options.message,
            data: options.data,
        },
    } as TonWalletResponseError<T>
}
export function createWalletEventError<T extends keyof ErrorCodeValuesByMethod>(
    _method: T,
    options: WalletErrorOptions,
): TonWalletResponseError<T> {
    return {
        event: 'connect_error',
        id: options.id,
        payload: {
            code: (options.code ?? 0),
            message: options.message,
            data: options.data,
        },
    } as TonWalletResponseError<T>
}


export const mapTonErrorCode = (code?: RpcErrorCode) => {
    switch (code) {
        case RpcErrorCode.REJECTED_BY_USER:
        case RpcErrorCode.RESOURCE_UNAVAILABLE:
            return TON_SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR
        case RpcErrorCode.INTERNAL:
        case RpcErrorCode.INVALID_REQUEST:
        case RpcErrorCode.MESSAGE_EXPIRED:
            return TON_SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR
        case RpcErrorCode.METHOD_NOT_FOUND:
            return TON_SEND_TRANSACTION_ERROR_CODES.METHOD_NOT_SUPPORTED
        case RpcErrorCode.TRY_AGAIN_LATER:
            return TON_SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR
        default:
            return TON_SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR
    }
}

const TON_ERROR_NAME = 'TonError'

export class TonError<T> extends Error {

    code: number

    data?: T

    name = TON_ERROR_NAME

    constructor(code: number, message: string, data?: T) {
        if (!Number.isInteger(code)) {
            throw new Error('"code" must be an integer')
        }

        if (!message || (typeof message as any) !== 'string') {
            throw new Error('"message" must be a nonempty string')
        }

        super(message)

        this.code = code
        this.data = data
    }

    serialize(): JsonRpcError {
        const serialized: JsonRpcError = {
            code: this.code,
            message: this.message,
            name: TON_ERROR_NAME,
        }
        if (this.data !== undefined) {
            serialized.data = this.data
        }
        if (this.stack) {
            serialized.stack = this.stack
        }
        return serialized
    }

    toString(): string {
        return safeStringify(this.serialize(), this.stringifyReplacer, 2)
    }

    toJSON(): any {
        const obj: any = {}

        Object.getOwnPropertyNames(this).forEach((key) => {
            obj[key] = (this as any)[key]
        }, this)

        return obj
    }

    private stringifyReplacer(_: unknown, value: unknown): unknown {
        if (value === '[Circular]') {
            return undefined
        }
        return value
    }

}
