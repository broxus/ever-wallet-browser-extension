import type * as nt from '@broxus/ever-wallet-wasm'
import type {
    AssetType,
    AssetTypeParams,
    FullContractState,
    FunctionCall,
    GenTimings,
} from 'everscale-inpage-provider'

import { type JsonRpcRequest, NekotonRpcError, RpcErrorCode } from '@app/shared'

export const invalidRequest = (req: JsonRpcRequest<unknown>, message: string, data?: unknown) => new NekotonRpcError(
    RpcErrorCode.INVALID_REQUEST,
    `${req.method}: ${message}`,
    data,
)

type WithParams<P, T> = P & { params: T };

export function requireParams<T>(req: JsonRpcRequest<T>): asserts req is WithParams<typeof req, T> {
    if (req.params == null || typeof req.params !== 'object') {
        throw invalidRequest(req, 'required params object')
    }
}

export function requireObject<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (typeof property !== 'object') {
        throw invalidRequest(req, `'${key.toString()}' must be an object`)
    }
}

export function requireOptionalObject<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (property != null && typeof property !== 'object') {
        throw invalidRequest(req, `'${key.toString()}' must be an object if specified`)
    }
}

export function requireBoolean<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (typeof property !== 'boolean') {
        throw invalidRequest(req, `'${key.toString()}' must be a boolean`)
    }
}

export function requireOptionalBoolean<T, O, P extends keyof O>(
    req: JsonRpcRequest<T>,
    object: O,
    key: P,
) {
    const property = object[key]
    if (property != null && typeof property !== 'boolean') {
        throw invalidRequest(req, `'${key.toString()}' must be a boolean if specified`)
    }
}

export function requireString<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (typeof property !== 'string' || property.length === 0) {
        throw invalidRequest(req, `'${key.toString()}' must be non-empty string`)
    }
}

export function requireOptionalString<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (property != null && (typeof property !== 'string' || property.length === 0)) {
        throw invalidRequest(req, `'${key.toString()}' must be a non-empty string if provided`)
    }
}

export function requireNumber<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (typeof property !== 'number') {
        throw invalidRequest(req, `'${key.toString()}' must be a number`)
    }
}

export function requireStringNumber<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (typeof property !== 'string' || !/^\d*$/.test(property)) {
        throw invalidRequest(req, `'${key.toString()}' must be a string containing only digits`)
    }
}


export function requireOptionalNumber<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (property != null && typeof property !== 'number') {
        throw invalidRequest(req, `'${key.toString()}' must be a number if provider`)
    }
}

export function requireArray<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (!Array.isArray(property)) {
        throw invalidRequest(req, `'${key.toString()}' must be an array`)
    }
}

export function requireOptional<T, O, P extends keyof O>(
    req: JsonRpcRequest<T>,
    object: O,
    key: P,
    predicate: (req: JsonRpcRequest<T>, object: O, key: P) => void,
) {
    const property = object[key]
    if (property != null) {
        predicate(req, object, key)
    }
}

export function requireTabid<T>(
    req: JsonRpcRequest<T>,
    tabId: number | undefined,
): asserts tabId is number {
    if (tabId == null) {
        throw invalidRequest(req, 'Invalid tab id')
    }
}

export function requireTransactionId<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    requireObject(req, object, key)
    const property = object[key] as unknown as nt.TransactionId
    requireString(req, property, 'lt')
    requireString(req, property, 'hash')
}

function requireLastTransactionId<T, O, P extends keyof O>(
    req: JsonRpcRequest<T>,
    object: O,
    key: P,
) {
    requireObject(req, object, key)
    const property = object[key] as unknown as nt.LastTransactionId
    requireBoolean(req, property, 'isExact')
    requireString(req, property, 'lt')
    requireOptionalString(req, property, 'hash')
}

function requireGenTimings<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    requireObject(req, object, key)
    const property = object[key] as unknown as GenTimings
    requireString(req, property, 'genLt')
    requireNumber(req, property, 'genUtime')
}

export function requireContractState<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    requireObject(req, object, key)
    const property = object[key] as unknown as FullContractState
    requireString(req, property, 'balance')
    requireGenTimings(req, property, 'genTimings')
    requireOptional(req, property, 'lastTransactionId', requireLastTransactionId)
    requireBoolean(req, property, 'isDeployed')
}

export function requireFunctionCall<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    requireObject(req, object, key)
    const property = object[key] as unknown as FunctionCall<string>
    requireString(req, property, 'abi')
    requireString(req, property, 'method')
    requireObject(req, property, 'params')
}

export function requireOptionalRawFunctionCall<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key] as unknown as null | string | FunctionCall<string>
    if (typeof property === 'string' || property == null) {
        return
    }
    if (typeof property === 'object') {
        requireString(req, property, 'abi')
        requireString(req, property, 'method')
        requireObject(req, property, 'params')
    }
    else {
        throw invalidRequest(req, `'${String(key)}' must be a function all or optional string`)
    }
}

export function requireMethodOrArray<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
    const property = object[key]
    if (property != null && typeof property !== 'string' && !Array.isArray(property)) {
        throw invalidRequest(req, `'${key.toString()}' must be a method name or an array of possible names`)
    }
}

export function requireAssetTypeParams<T, O, P extends keyof O>(
    req: JsonRpcRequest<T>,
    object: O,
    key: P,
    assetType: AssetType,
) {
    requireObject(req, object, key)
    const property = object[key] as unknown as AssetTypeParams<AssetType>
    switch (assetType) {
        case 'tip3_token': {
            requireString(req, property, 'rootContract')
            break
        }
        default:
            throw invalidRequest(req, 'Unknown asset type')
    }
}

export function expectTransaction(transaction: nt.Transaction | undefined): nt.Transaction {
    if (transaction == null) {
        throw new NekotonRpcError(RpcErrorCode.MESSAGE_EXPIRED, 'Message expired')
    }
    return transaction
}


export function requireOptionalSignatureId<T, O, P extends keyof O>(
    req: JsonRpcRequest<T>,
    object: O,
    key: P,
) {
    const property = object[key]
    if (property != null) {
        if (typeof property !== 'boolean' && typeof property !== 'number') {
            throw invalidRequest(req, `'${String(key)}' must be an optional boolean or number`)
        }
    }
}

export function requireContractStateBoc<T, O, P extends keyof O>(
    req: JsonRpcRequest<T>,
    object: O,
    key: P,
) {
    requireObject(req, object, key)
    const property = object[key] as unknown as FullContractState
    requireString(req, property, 'boc')
}
