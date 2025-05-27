import { TON_CONNECT_EVENT_ERROR_CODES, TON_DISCONNECT_ERROR_CODES, TON_SEND_TRANSACTION_ERROR_CODES, TON_SIGN_DATA_ERROR_CODES, TonWalletResponseError } from '@app/models/background'

import { RpcErrorCode } from '../errors'


type ErrorCodeByMethod = {
    disconnect: TON_DISCONNECT_ERROR_CODES;
    sendTransaction: TON_SEND_TRANSACTION_ERROR_CODES;
    signData: TON_SIGN_DATA_ERROR_CODES;
    connect: TON_CONNECT_EVENT_ERROR_CODES;
};

type EnumValues<T> = T extends Record<string, number> ? T[keyof T] : never;
type ErrorCodeValuesByMethod = {
    [K in keyof ErrorCodeByMethod]: EnumValues<ErrorCodeByMethod[K]>;
  };


type WalletErrorOptions = {
    id: number | string;
    message: string;
    code?: number;
    data?: unknown;
};

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
            return TON_SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR
        case RpcErrorCode.INTERNAL:
        case RpcErrorCode.INVALID_REQUEST:
        case RpcErrorCode.MESSAGE_EXPIRED:
            return TON_SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR
        case RpcErrorCode.METHOD_NOT_FOUND:
            return TON_SEND_TRANSACTION_ERROR_CODES.METHOD_NOT_SUPPORTED
        case RpcErrorCode.TRY_AGAIN_LATER:
        case RpcErrorCode.RESOURCE_UNAVAILABLE:
            return TON_SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR
        default:
            return TON_SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR
    }
}
