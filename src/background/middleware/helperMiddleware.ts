import type * as nt from '@wallet/nekoton-wasm'
import { RootTokenContractDetailsWithAddress } from '@wallet/nekoton-wasm'
import { FunctionCall, Permission } from 'everscale-inpage-provider'

import { NekotonRpcError, RpcErrorCode } from '@app/models'
import type { Nekoton } from '@app/models'
import type { JsonRpcMiddleware } from '@app/shared'
import { UniqueArray } from '@app/shared'

import { AccountController } from '../controllers/AccountController/AccountController'
import { PermissionsController } from '../controllers/PermissionsController'
import {
    invalidRequest,
    requireArray,
    requireBoolean,
    requireFunctionCall,
    requireNumber,
    requireObject,
    requireOptionalString,
    requireParams,
    requireString,
} from './utils'

export interface HelperMiddlewareApi {
    parseKnownPayload: {
        input: {
            payload: string;
        };
        output: nt.KnownPayload;
    };
    checkPublicKey: {
        input: {
            publicKey: string;
        };
    };
    signMessage: {
        input: {
            address: string;
            destination: string;
            amount: string;
            bounce: boolean;
            body: string;
            timeout: number;
            password: nt.KeyPassword;
        };
        output: nt.SignedMessage;
    };
    signExternalMessage: {
        input: {
            destination: string;
            stateInit: string | undefined;
            payload: FunctionCall<string>;
            timeout: number;
            password: nt.KeyPassword;
        };
        output: nt.SignedMessage;
    };
    signData: {
        input: {
            data: string;
            password: nt.KeyPassword;
        };
        output: nt.SignedData;
    };
    signDataRaw: {
        input: {
            data: string;
            password: nt.KeyPassword;
        };
        output: nt.SignedDataRaw;
    };
    encryptData: {
        input: {
            data: string;
            password: nt.KeyPassword;
            recipientPublicKeys: string[];
            algorithm: nt.EncryptionAlgorithm;
        };
        output: nt.EncryptedData[];
    };
    decryptData: {
        input: {
            encryptedData: nt.EncryptedData;
            password: nt.KeyPassword;
        };
        output: string;
    };
    getTokenWalletInfo: {
        input: {
            account: string;
            rootContract: string;
        };
        output: {
            hasTokenWallet: boolean;
            details: RootTokenContractDetailsWithAddress;
        };
    };
    updateTokenWallets: {
        input: {
            account: string;
            rootContract: string;
        };
    };
}

interface CreateProviderMiddlewareOptions {
    origin: string;
    nekoton: Nekoton;
    clock: nt.ClockWithOffset;
    accountController: AccountController;
    permissionsController: PermissionsController;
}

type HelperMethod<T extends keyof HelperMiddlewareApi> = HelperMiddlewareApi[T] extends {
    input?: infer I, output?: infer O
}
    ? (
        ...args: [
            ...Parameters<JsonRpcMiddleware<I extends undefined ? {} : I, O extends undefined ? {} : O>>,
            CreateProviderMiddlewareOptions,
        ]
    ) => Promise<void>
    : never;

function requirePermissions<P extends Permission>(
    { origin, permissionsController }: CreateProviderMiddlewareOptions,
    permissions: UniqueArray<P>[],
) {
    permissionsController.checkPermissions(origin, permissions)
}

// Helper api
//

const parseKnownPayload: HelperMethod<'parseKnownPayload'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireString(req, req.params, 'payload')

    const { payload } = req.params

    res.result = ctx.nekoton.parseKnownPayload(payload)
    end()
}

const checkPublicKey: HelperMethod<'checkPublicKey'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireString(req, req.params, 'publicKey')

    const { nekoton } = ctx
    const { publicKey } = req.params

    nekoton.checkPublicKey(publicKey)

    res.result = {}
    end()
}

const signMessage: HelperMethod<'signMessage'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireString(req, req.params, 'address')
    requireString(req, req.params, 'destination')
    requireString(req, req.params, 'amount')
    requireNumber(req, req.params, 'timeout')
    requireBoolean(req, req.params, 'bounce')
    requireObject(req, req.params, 'password')

    const { accountController } = ctx
    const { address, destination, amount, bounce, body, timeout, password } = req.params

    const signedMessage = await accountController.useTonWallet(address, async wallet => {
        const contractState = await wallet.getContractState()
        if (contractState == null) {
            throw invalidRequest(req, `Failed to get contract state for ${address}`)
        }

        let unsignedMessage: nt.UnsignedMessage | undefined
        try {
            unsignedMessage = wallet.prepareTransfer(
                contractState,
                password.data.publicKey,
                destination,
                amount,
                bounce,
                body,
                timeout,
            )
        }
        finally {
            contractState.free()
        }

        if (unsignedMessage == null) {
            throw invalidRequest(req, 'Contract must be deployed first')
        }

        try {
            return await accountController.signPreparedMessage(unsignedMessage, password)
        }
        catch (e: any) {
            throw invalidRequest(req, e.toString())
        }
        finally {
            unsignedMessage.free()
        }
    })

    res.result = signedMessage
    end()
}

const signExternalMessage: HelperMethod<'signExternalMessage'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireString(req, req.params, 'destination')
    requireOptionalString(req, req.params, 'stateInit')
    requireFunctionCall(req, req.params, 'payload')
    requireNumber(req, req.params, 'timeout')
    requireObject(req, req.params, 'password')

    const { accountController, clock } = ctx
    const { destination, payload, stateInit, timeout, password } = req.params

    let unsignedMessage: nt.UnsignedMessage
    try {
        unsignedMessage = ctx.nekoton.createExternalMessage(
            clock,
            destination,
            payload.abi,
            payload.method,
            stateInit,
            payload.params,
            password.data.publicKey,
            timeout,
        )
    }
    catch (e: any) {
        throw invalidRequest(req, e.toString())
    }

    let signedMessage: nt.SignedMessage
    try {
        unsignedMessage.refreshTimeout(clock)
        signedMessage = await accountController.signPreparedMessage(unsignedMessage, password)
    }
    catch (e: any) {
        throw invalidRequest(req, e.toString())
    }
    finally {
        unsignedMessage.free()
    }

    res.result = signedMessage
    end()
}

const signData: HelperMethod<'signData'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireString(req, req.params, 'data')
    requireObject(req, req.params, 'password')

    const { accountController } = ctx
    const { data, password } = req.params

    res.result = await accountController.signData(data, password)
    end()
}

const signDataRaw: HelperMethod<'signDataRaw'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireString(req, req.params, 'data')
    requireObject(req, req.params, 'password')

    const { accountController } = ctx
    const { data, password } = req.params

    res.result = await accountController.signDataRaw(data, password)
    end()
}

const encryptData: HelperMethod<'encryptData'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireString(req, req.params, 'data')
    requireObject(req, req.params, 'password')
    requireArray(req, req.params, 'recipientPublicKeys')
    requireString(req, req.params, 'algorithm')

    const { accountController } = ctx
    const { data, password, recipientPublicKeys, algorithm } = req.params

    res.result = await accountController.encryptData(data, recipientPublicKeys, algorithm, password)
    end()
}

const decryptData: HelperMethod<'decryptData'> = async (req, res, next, end, ctx) => {
    requireParams(req)
    requireObject(req, req.params, 'encryptedData')
    requireObject(req, req.params, 'password')

    const { accountController } = ctx
    const { encryptedData, password } = req.params

    res.result = await accountController.decryptData(encryptedData, password)
    end()
}

const getTokenWalletInfo: HelperMethod<'getTokenWalletInfo'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction'])
    requireParams(req)
    requireString(req, req.params, 'account')
    requireString(req, req.params, 'rootContract')

    const { account, rootContract } = req.params
    const { accountController } = ctx

    res.result = {
        hasTokenWallet: accountController.hasTokenWallet(account, rootContract),
        details: await accountController.getTokenRootDetails(rootContract, account),
    }
    end()
}

const updateTokenWallets: HelperMethod<'updateTokenWallets'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction'])
    requireParams(req)
    requireString(req, req.params, 'account')
    requireString(req, req.params, 'rootContract')

    const { account, rootContract } = req.params
    const { accountController } = ctx

    await accountController.updateTokenWallets(account, {
        [rootContract]: true,
    })

    res.result = {}
    end()
}

const helperRequests: { [K in keyof HelperMiddlewareApi]: HelperMethod<K> } = {
    parseKnownPayload,
    checkPublicKey,
    signMessage,
    signExternalMessage,
    signData,
    signDataRaw,
    encryptData,
    decryptData,
    getTokenWalletInfo,
    updateTokenWallets,
}

export const createHelperMiddleware = (
    options: CreateProviderMiddlewareOptions,
): JsonRpcMiddleware<unknown, unknown> => (req, res, next, end) => {
    if (!(helperRequests as any)[req.method]) {
        end(
            new NekotonRpcError(
                RpcErrorCode.METHOD_NOT_FOUND,
                `provider method '${req.method}' not found`,
            ),
        )
    }
    else {
        const method = (helperRequests as any)[req.method] as HelperMethod<any>
        method(req, res, next, end, options)
            .catch(end)
    }
}
