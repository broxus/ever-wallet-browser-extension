import { NekotonRpcError, Nekoton, RpcErrorCode } from '@app/models';
import { JsonRpcMiddleware, JsonRpcRequest, UniqueArray } from '@app/shared';
import type {
  AssetType,
  AssetTypeParams,
  FullContractState,
  GenTimings,
  Permission,
  RawFunctionCall,
  RawProviderApi,
  RawTokensObject,
} from 'everscale-inpage-provider';
import { nanoid } from 'nanoid';
import type {
  AbiParam,
  ClockWithOffset,
  KnownPayload,
  LastTransactionId,
  SignedMessage,
  Transaction,
  TransactionId,
  UnsignedMessage,
} from 'nekoton-wasm';
import manifest from '../static/manifest.json';
import { AccountController } from './controllers/AccountController/AccountController';
import { ApprovalController } from './controllers/ApprovalController';
import { ConnectionController } from './controllers/ConnectionController';
import { PermissionsController } from './controllers/PermissionsController';
import { SubscriptionController } from './controllers/SubscriptionController';

const invalidRequest = (req: JsonRpcRequest<unknown>, message: string, data?: unknown) => new NekotonRpcError(
  RpcErrorCode.INVALID_REQUEST,
  `${req.method}: ${message}`,
  data,
);

interface CreateProviderMiddlewareOptions {
  origin: string;
  tabId?: number;
  isInternal: boolean;
  clock: ClockWithOffset;
  approvalController: ApprovalController;
  accountController: AccountController;
  permissionsController: PermissionsController;
  connectionController: ConnectionController;
  subscriptionsController: SubscriptionController;
}

type ProviderMethod<T extends keyof RawProviderApi> = RawProviderApi[T] extends { input?: infer I, output?: infer O }
  ? (
    ...args: [
      ...Parameters<JsonRpcMiddleware<I extends undefined ? {} : I, O extends undefined ? {} : O>>,
      CreateProviderMiddlewareOptions,
    ]
  ) => Promise<void>
  : never;

// helper methods:
//

function requirePermissions<P extends Permission>(
  { origin, isInternal, permissionsController }: CreateProviderMiddlewareOptions,
  permissions: UniqueArray<P>[],
) {
  if (!isInternal) {
    permissionsController.checkPermissions(origin, permissions);
  }
}

type WithParams<P, T> = P & { params: T };

function requireParams<T>(req: JsonRpcRequest<T>): asserts req is WithParams<typeof req, T> {
  if (req.params == null || typeof req.params !== 'object') {
    throw invalidRequest(req, 'required params object');
  }
}

function requireObject<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'object') {
    throw invalidRequest(req, `'${key.toString()}' must be an object`);
  }
}

function requireOptionalObject<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (property != null && typeof property !== 'object') {
    throw invalidRequest(req, `'${key.toString()}' must be an object if specified`);
  }
}

function requireBoolean<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'boolean') {
    throw invalidRequest(req, `'${key.toString()}' must be a boolean`);
  }
}

function requireOptionalBoolean<T, O, P extends keyof O>(
  req: JsonRpcRequest<T>,
  object: O,
  key: P,
) {
  const property = object[key];
  if (property != null && typeof property !== 'boolean') {
    throw invalidRequest(req, `'${key.toString()}' must be a boolean if specified`);
  }
}

function requireString<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'string' || property.length === 0) {
    throw invalidRequest(req, `'${key.toString()}' must be non-empty string`);
  }
}

function requireOptionalString<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (property != null && (typeof property !== 'string' || property.length === 0)) {
    throw invalidRequest(req, `'${key.toString()}' must be a non-empty string if provided`);
  }
}

function requireNumber<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'number') {
    throw invalidRequest(req, `'${key.toString()}' must be a number`);
  }
}

function requireOptionalNumber<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (property != null && typeof property !== 'number') {
    throw invalidRequest(req, `'${key.toString()}' must be a number if provider`);
  }
}

function requireArray<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (!Array.isArray(property)) {
    throw invalidRequest(req, `'${key.toString()}' must be an array`);
  }
}

function requireOptional<T, O, P extends keyof O>(
  req: JsonRpcRequest<T>,
  object: O,
  key: P,
  predicate: (req: JsonRpcRequest<T>, object: O, key: P) => void,
) {
  const property = object[key];
  if (property != null) {
    predicate(req, object, key);
  }
}

function requireTabid<T>(
  req: JsonRpcRequest<T>,
  tabId: number | undefined,
): asserts tabId is number {
  if (tabId == null) {
    throw invalidRequest(req, 'Invalid tab id');
  }
}

function requireTransactionId<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  requireObject(req, object, key);
  const property = object[key] as unknown as TransactionId;
  requireString(req, property, 'lt');
  requireString(req, property, 'hash');
}

function requireLastTransactionId<T, O, P extends keyof O>(
  req: JsonRpcRequest<T>,
  object: O,
  key: P,
) {
  requireObject(req, object, key);
  const property = object[key] as unknown as LastTransactionId;
  requireBoolean(req, property, 'isExact');
  requireString(req, property, 'lt');
  requireOptionalString(req, property, 'hash');
}

function requireGenTimings<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  requireObject(req, object, key);
  const property = object[key] as unknown as GenTimings;
  requireString(req, property, 'genLt');
  requireNumber(req, property, 'genUtime');
}

function requireContractState<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  requireObject(req, object, key);
  const property = object[key] as unknown as FullContractState;
  requireString(req, property, 'balance');
  requireGenTimings(req, property, 'genTimings');
  requireOptional(req, property, 'lastTransactionId', requireLastTransactionId);
  requireBoolean(req, property, 'isDeployed');
}

function requireFunctionCall<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  requireObject(req, object, key);
  const property = object[key] as unknown as RawFunctionCall;
  requireString(req, property, 'abi');
  requireString(req, property, 'method');
  requireObject(req, property, 'params');
}

function requireMethodOrArray<T, O, P extends keyof O>(req: JsonRpcRequest<T>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'string' && !Array.isArray(property)) {
    throw invalidRequest(req, `'${key.toString()}' must be a method name or an array of possible names`);
  }
}

function requireAssetTypeParams<T, O, P extends keyof O>(
  req: JsonRpcRequest<T>,
  object: O,
  key: P,
  assetType: AssetType,
) {
  requireObject(req, object, key);
  const property = object[key] as unknown as AssetTypeParams<AssetType>;
  switch (assetType) {
    case 'tip3_token': {
      requireString(req, property, 'rootContract');
      break;
    }
    default:
      throw invalidRequest(req, 'Unknown asset type');
  }
}

export class ProviderMiddleware {
  constructor(private nt: Nekoton) {
  }

  createProviderMiddleware = (
    options: CreateProviderMiddlewareOptions,
  ): JsonRpcMiddleware<unknown, unknown> => { // eslint-disable-line arrow-body-style
    return (req, res, next, end) => {
      if (!(this as any)[req.method]) {
        end(
          new NekotonRpcError(
            RpcErrorCode.METHOD_NOT_FOUND,
            `provider method '${req.method}' not found`,
          ),
        );
      } else {
        const method = (this as any)[req.method] as ProviderMethod<any>;
        method(req, res, next, end, options)
          .catch(end);
      }
    };
  };

  requestPermissions: ProviderMethod<'requestPermissions'> = async (
    req,
    res,
    _next,
    end,
    { origin, isInternal, permissionsController },
  ) => {
    if (isInternal) {
      throw invalidRequest(req, 'cannot request permissions for internal streams');
    }

    requireParams(req);

    const { permissions } = req.params;
    requireArray(req, req.params, 'permissions');

    res.result = await permissionsController.requestPermissions(origin, permissions as Permission[]);
    end();
  };

  changeAccount: ProviderMethod<'changeAccount'> = async (_req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);

    const { origin, permissionsController } = ctx;

    res.result = await permissionsController.changeAccount(origin);
    end();
  };

  disconnect: ProviderMethod<'disconnect'> = async (_req, res, _next, end, ctx) => {
    const { origin, tabId, permissionsController, subscriptionsController } = ctx;

    await permissionsController.removeOrigin(origin);
    await subscriptionsController.unsubscribeOriginFromAllContracts(origin, tabId);
    res.result = {};
    end();
  };

  subscribe: ProviderMethod<'subscribe'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { address, subscriptions } = req.params;
    requireString(req, req.params, 'address');
    requireOptionalObject(req, req.params, 'subscriptions');

    if (!this.nt.checkAddress(address)) {
      throw invalidRequest(req, 'Invalid address');
    }

    const { tabId, subscriptionsController } = ctx;
    requireTabid(req, tabId);

    res.result = await subscriptionsController.subscribeToContract(tabId, address, subscriptions);
    end();
  };

  unsubscribe: ProviderMethod<'unsubscribe'> = async (req, res, _next, end, ctx) => {
    requireParams(req);

    const { address } = req.params;
    requireString(req, req.params, 'address');

    if (!this.nt.checkAddress(address)) {
      throw invalidRequest(req, 'Invalid address');
    }

    const { tabId, subscriptionsController } = ctx;
    requireTabid(req, tabId);

    await subscriptionsController.unsubscribeFromContract(tabId, address);
    res.result = {};
    end();
  };

  unsubscribeAll: ProviderMethod<'unsubscribeAll'> = async (req, res, _next, end, ctx) => {
    const { tabId, subscriptionsController } = ctx;
    requireTabid(req, tabId);

    await subscriptionsController.unsubscribeFromAllContracts(tabId);

    res.result = {};
    end();
  };

  getProviderState: ProviderMethod<'getProviderState'> = async (
    _req,
    res,
    _next,
    end,
    { origin, tabId, connectionController, permissionsController, subscriptionsController },
  ) => {
    const { selectedConnection } = connectionController.state;
    const permissions = permissionsController.getPermissions(origin);

    const convertVersionToInt32 = (version: string): number => {
      const parts = version.split('.');
      if (parts.length !== 3) {
        throw new Error('Received invalid version string');
      }

      parts.forEach((part) => {
        if (~~part > 999) {
          throw new Error(`Version string invalid, ${part} is too large`);
        }
      });

      let multiplier = 1000000;
      let numericVersion = 0;
      for (let i = 0; i < 3; i++) {
        numericVersion += ~~parts[i] * multiplier;
        multiplier /= 1000;
      }
      return numericVersion;
    };

    const version = (manifest as any).version;

    res.result = {
      version,
      numericVersion: convertVersionToInt32(version),
      selectedConnection: selectedConnection.group,
      supportedPermissions: ['basic', 'accountInteraction'],
      permissions,
      subscriptions: tabId ? subscriptionsController.getTabSubscriptions(tabId) : {},
    };
    end();
  };

  getFullContractState: ProviderMethod<'getFullContractState'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { address } = req.params;
    requireString(req, req.params, 'address');

    const { connectionController } = ctx;

    try {
      res.result = {
        state: await connectionController.use(
          async ({ data: { transport } }) => transport.getFullContractState(address),
        ),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  getAccountsByCodeHash: ProviderMethod<'getAccountsByCodeHash'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { codeHash, limit, continuation } = req.params;
    requireString(req, req.params, 'codeHash');
    requireOptionalNumber(req, req.params, 'limit');
    requireOptionalString(req, req.params, 'continuation');

    const { connectionController } = ctx;

    try {
      res.result = await connectionController.use(
        async ({ data: { transport } }) => transport.getAccountsByCodeHash(codeHash, limit || 50, continuation),
      );
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  getTransactions: ProviderMethod<'getTransactions'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { address, continuation, limit } = req.params;
    requireString(req, req.params, 'address');
    requireOptional(req, req.params, 'continuation', requireTransactionId);
    requireOptionalNumber(req, req.params, 'limit');

    const { connectionController } = ctx;

    try {
      res.result = await connectionController.use(
        async ({ data: { transport } }) => transport.getTransactions(address, continuation, limit || 50),
      );

      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  getTransaction: ProviderMethod<'getTransaction'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { hash } = req.params;
    requireString(req, req.params, 'hash');

    const { connectionController } = ctx;

    try {
      res.result = {
        transaction: await connectionController.use(
          async ({ data: { transport } }) => transport.getTransaction(hash),
        ),
      };

      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  runLocal: ProviderMethod<'runLocal'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { address, cachedState, responsible, functionCall } = req.params;
    requireString(req, req.params, 'address');
    requireOptional(req, req.params, 'cachedState', requireContractState);
    requireOptionalBoolean(req, req.params, 'responsible');
    requireFunctionCall(req, req.params, 'functionCall');

    const { clock, connectionController } = ctx;

    let contractState = cachedState;

    if (contractState == null) {
      contractState = await connectionController.use(
        async ({ data: { transport } }) => transport.getFullContractState(address),
      );
    }

    if (contractState == null) {
      throw invalidRequest(req, 'Account not found');
    }
    if (!contractState.isDeployed || contractState.lastTransactionId == null) {
      throw invalidRequest(req, 'Account is not deployed');
    }

    try {
      const { output, code } = this.nt.runLocal(
        clock,
        contractState.boc,
        functionCall.abi,
        functionCall.method,
        functionCall.params,
        responsible || false,
      );

      res.result = {
        output,
        code,
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  getExpectedAddress: ProviderMethod<'getExpectedAddress'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { tvc, abi, workchain, publicKey, initParams } = req.params;
    requireString(req, req.params, 'tvc');
    requireString(req, req.params, 'abi');
    requireOptionalNumber(req, req.params, 'workchain');
    requireOptionalString(req, req.params, 'publicKey');

    try {
      res.result = {
        address: this.nt.getExpectedAddress(tvc, abi, workchain || 0, publicKey, initParams),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  getBocHash: ProviderMethod<'getBocHash'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { boc } = req.params;
    requireString(req, req.params, 'boc');

    try {
      res.result = {
        hash: this.nt.getBocHash(boc),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  packIntoCell: ProviderMethod<'packIntoCell'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { structure, data } = req.params;
    requireArray(req, req.params, 'structure');

    try {
      res.result = {
        boc: this.nt.packIntoCell(structure as AbiParam[], data),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  unpackFromCell: ProviderMethod<'unpackFromCell'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { structure, boc, allowPartial } = req.params;
    requireArray(req, req.params, 'structure');
    requireString(req, req.params, 'boc');
    requireBoolean(req, req.params, 'allowPartial');

    try {
      res.result = {
        data: this.nt.unpackFromCell(structure as AbiParam[], boc, allowPartial),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  extractPublicKey: ProviderMethod<'extractPublicKey'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { boc } = req.params;
    requireString(req, req.params, 'boc');

    try {
      res.result = {
        publicKey: this.nt.extractPublicKey(boc),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  codeToTvc: ProviderMethod<'codeToTvc'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { code } = req.params;
    requireString(req, req.params, 'code');

    try {
      res.result = {
        tvc: this.nt.codeToTvc(code),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  splitTvc: ProviderMethod<'splitTvc'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { tvc } = req.params;
    requireString(req, req.params, 'tvc');

    try {
      res.result = this.nt.splitTvc(tvc);
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  encodeInternalInput: ProviderMethod<'encodeInternalInput'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    requireFunctionCall(req, req, 'params');
    const { abi, method, params } = req.params;

    try {
      res.result = {
        boc: this.nt.encodeInternalInput(abi, method, params),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  decodeInput: ProviderMethod<'decodeInput'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { body, abi, method, internal } = req.params;
    requireString(req, req.params, 'body');
    requireString(req, req.params, 'abi');
    requireMethodOrArray(req, req.params, 'method');
    requireBoolean(req, req.params, 'internal');

    try {
      res.result = this.nt.decodeInput(body, abi, method, internal) || null;
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  decodeEvent: ProviderMethod<'decodeEvent'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { body, abi, event } = req.params;
    requireString(req, req.params, 'body');
    requireString(req, req.params, 'abi');
    requireMethodOrArray(req, req.params, 'event');

    try {
      res.result = this.nt.decodeEvent(body, abi, event) || null;
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  decodeOutput: ProviderMethod<'decodeOutput'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { body, abi, method } = req.params;
    requireString(req, req.params, 'body');
    requireString(req, req.params, 'abi');
    requireMethodOrArray(req, req.params, 'method');

    try {
      res.result = this.nt.decodeOutput(body, abi, method) || null;
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  decodeTransaction: ProviderMethod<'decodeTransaction'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { transaction, abi, method } = req.params;
    requireString(req, req.params, 'abi');
    requireMethodOrArray(req, req.params, 'method');

    try {
      res.result = this.nt.decodeTransaction(transaction, abi, method) || null;
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  decodeTransactionEvents: ProviderMethod<'decodeTransactionEvents'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { transaction, abi } = req.params;
    requireString(req, req.params, 'abi');

    try {
      res.result = {
        events: this.nt.decodeTransactionEvents(transaction, abi),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  verifySignature: ProviderMethod<'verifySignature'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { publicKey, dataHash, signature } = req.params;
    requireString(req, req.params, 'publicKey');
    requireString(req, req.params, 'dataHash');
    requireString(req, req.params, 'signature');

    try {
      res.result = {
        isValid: this.nt.verifySignature(publicKey, dataHash, signature),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }
  };

  sendUnsignedExternalMessage: ProviderMethod<'sendUnsignedExternalMessage'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['basic']);
    requireParams(req);

    const { recipient, stateInit, payload, local } = req.params;
    requireString(req, req.params, 'recipient');
    requireOptionalString(req, req.params, 'stateInit');
    requireFunctionCall(req, req.params, 'payload');
    requireOptionalBoolean(req, req.params, 'local');

    const { tabId, subscriptionsController } = ctx;
    requireTabid(req, tabId);

    let repackedRecipient: string;
    try {
      repackedRecipient = this.nt.repackAddress(recipient);
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }

    let signedMessage: SignedMessage;
    try {
      signedMessage = this.nt.createExternalMessageWithoutSignature(
        repackedRecipient,
        payload.abi,
        payload.method,
        stateInit,
        payload.params,
        60,
      );
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }

    let transaction: Transaction;
    if (local === true) {
      transaction = await subscriptionsController.sendMessageLocally(
        tabId,
        repackedRecipient,
        signedMessage,
      );
    } else {
      transaction = await subscriptionsController.sendMessage(
        tabId,
        repackedRecipient,
        signedMessage,
      );
    }

    let output: RawTokensObject | undefined;
    try {
      const decoded = this.nt.decodeTransaction(transaction, payload.abi, payload.method);
      output = decoded?.output;
    } catch (_) { // eslint-disable-line no-empty
    }

    res.result = {
      transaction,
      output,
    };
    end();
  };

  addAsset: ProviderMethod<'addAsset'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { account, type, params } = req.params;
    requireString(req, req.params, 'account');
    requireString(req, req.params, 'type');
    requireAssetTypeParams(req, req.params, 'params', type);

    const { origin, permissionsController, accountController, approvalController } = ctx;

    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.address !== account) {
      throw invalidRequest(req, 'Specified account is not allowed');
    }

    switch (type) {
      case 'tip3_token': {
        const { rootContract: rawRootContract } = params;
        let rootContract: string;
        try {
          rootContract = this.nt.repackAddress(rawRootContract);
        } catch (e: any) {
          throw invalidRequest(req, e.toString());
        }

        const hasTokenWallet = accountController.hasTokenWallet(account, rootContract);
        if (hasTokenWallet) {
          res.result = { newAsset: false };
          return end();
        }

        const details = await accountController.getTokenRootDetails(rootContract, account);
        await approvalController.addAndShowApprovalRequest({
          origin,
          type: 'addTip3Token',
          requestData: {
            account,
            details,
          },
        });
        await accountController.updateTokenWallets(account, {
          [rootContract]: true,
        });

        res.result = { newAsset: true };
        return end();
      }
      default:
        throw invalidRequest(req, 'Unknown asset type');
    }
  };

  signData: ProviderMethod<'signData'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { publicKey, data } = req.params;
    requireString(req, req.params, 'publicKey');
    requireString(req, req.params, 'data');

    const { origin, approvalController, accountController, permissionsController } = ctx;
    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.publicKey !== publicKey) {
      throw invalidRequest(req, 'Specified signer is not allowed');
    }

    const approvalId = nanoid();
    const password = await approvalController.addAndShowApprovalRequest({
      origin,
      id: approvalId,
      type: 'signData',
      requestData: {
        publicKey,
        data,
      },
    });

    try {
      res.result = await accountController.signData(data, password);
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    } finally {
      approvalController.deleteApproval(approvalId);
    }
  };

  signDataRaw: ProviderMethod<'signDataRaw'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { publicKey, data } = req.params;
    requireString(req, req.params, 'publicKey');
    requireString(req, req.params, 'data');

    const { origin, approvalController, accountController, permissionsController } = ctx;
    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.publicKey !== publicKey) {
      throw invalidRequest(req, 'Specified signer is not allowed');
    }

    const approvalId = nanoid();
    const password = await approvalController.addAndShowApprovalRequest({
      origin,
      id: approvalId,
      type: 'signData',
      requestData: {
        publicKey,
        data,
      },
    });

    try {
      res.result = await accountController.signDataRaw(data, password);
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    } finally {
      approvalController.deleteApproval(approvalId);
    }
  };

  encryptData: ProviderMethod<'encryptData'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { publicKey, recipientPublicKeys, algorithm, data } = req.params;
    requireString(req, req.params, 'publicKey');
    requireArray(req, req.params, 'recipientPublicKeys');
    requireString(req, req.params, 'algorithm');
    requireString(req, req.params, 'data');

    const { origin, approvalController, accountController, permissionsController } = ctx;
    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.publicKey !== publicKey) {
      throw invalidRequest(req, 'Specified encryptor public key is not allowed');
    }

    const approvalId = nanoid();
    const password = await approvalController.addAndShowApprovalRequest({
      origin,
      id: approvalId,
      type: 'encryptData',
      requestData: {
        publicKey,
        data,
      },
    });

    try {
      res.result = {
        encryptedData: await accountController.encryptData(
          data,
          recipientPublicKeys,
          algorithm,
          password,
        ),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    } finally {
      approvalController.deleteApproval(approvalId);
    }
  };

  decryptData: ProviderMethod<'decryptData'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { encryptedData } = req.params;
    requireObject(req, req.params, 'encryptedData');
    requireString(req, encryptedData, 'algorithm');
    requireString(req, encryptedData, 'sourcePublicKey');
    requireString(req, encryptedData, 'recipientPublicKey');
    requireString(req, encryptedData, 'data');
    requireString(req, encryptedData, 'nonce');

    const { origin, approvalController, accountController, permissionsController } = ctx;
    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.publicKey !== encryptedData.recipientPublicKey) {
      throw invalidRequest(req, 'Specified recipient public key is not allowed');
    }

    try {
      this.nt.checkPublicKey(encryptedData.sourcePublicKey);
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }

    const approvalId = nanoid();
    const password = await approvalController.addAndShowApprovalRequest({
      origin,
      id: approvalId,
      type: 'decryptData',
      requestData: {
        publicKey: allowedAccount.publicKey,
        sourcePublicKey: encryptedData.sourcePublicKey,
      },
    });

    try {
      res.result = {
        data: await accountController.decryptData(encryptedData, password),
      };
      end();
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    } finally {
      approvalController.deleteApproval(approvalId);
    }
  };

  estimateFees: ProviderMethod<'estimateFees'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { sender, recipient, amount, payload } = req.params;
    requireString(req, req.params, 'sender');
    requireString(req, req.params, 'recipient');
    requireString(req, req.params, 'amount');
    requireOptional(req, req.params, 'payload', requireFunctionCall);

    const { origin, permissionsController, accountController } = ctx;

    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.address !== sender) {
      throw invalidRequest(req, 'Specified sender is not allowed');
    }

    const selectedAddress = allowedAccount.address;
    let repackedRecipient: string;
    try {
      repackedRecipient = this.nt.repackAddress(recipient);
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }

    let body: string = '';
    if (payload != null) {
      try {
        body = this.nt.encodeInternalInput(payload.abi, payload.method, payload.params);
      } catch (e: any) {
        throw invalidRequest(req, e.toString());
      }
    }

    const fees = await accountController.useTonWallet(selectedAddress, async (wallet) => {
      const contractState = await wallet.getContractState();
      if (contractState == null) {
        throw invalidRequest(req, `Failed to get contract state for ${selectedAddress}`);
      }

      let unsignedMessage: UnsignedMessage | undefined;
      try {
        unsignedMessage = wallet.prepareTransfer(
          contractState,
          wallet.publicKey,
          repackedRecipient,
          amount,
          false,
          body,
          60,
        );
      } finally {
        contractState.free();
      }

      if (unsignedMessage == null) {
        throw invalidRequest(req, 'Contract must be deployed first');
      }

      try {
        const signedMessage = unsignedMessage.signFake();
        return await wallet.estimateFees(signedMessage, {});
      } catch (e: any) {
        throw invalidRequest(req, e.toString());
      } finally {
        unsignedMessage.free();
      }
    });

    res.result = {
      fees,
    };
    end();
  };

  sendMessage: ProviderMethod<'sendMessage'> = async (req, res, _next, end, ctx) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { sender, recipient, amount, bounce, payload } = req.params;
    requireString(req, req.params, 'sender');
    requireString(req, req.params, 'recipient');
    requireString(req, req.params, 'amount');
    requireBoolean(req, req.params, 'bounce');
    requireOptional(req, req.params, 'payload', requireFunctionCall);

    const { origin, permissionsController, accountController, approvalController } = ctx;

    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.address !== sender) {
      throw invalidRequest(req, 'Specified sender is not allowed');
    }

    const selectedAddress = allowedAccount.address;
    let repackedRecipient: string;
    try {
      repackedRecipient = this.nt.repackAddress(recipient);
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }

    let body: string = '';
    let knownPayload: KnownPayload | undefined;
    if (payload != null) {
      try {
        body = this.nt.encodeInternalInput(payload.abi, payload.method, payload.params);
        knownPayload = this.nt.parseKnownPayload(body);
      } catch (e: any) {
        throw invalidRequest(req, e.toString());
      }
    }

    const approvalId = nanoid();
    const password = await approvalController.addAndShowApprovalRequest({
      id: approvalId,
      origin,
      type: 'sendMessage',
      requestData: {
        sender: selectedAddress,
        recipient: repackedRecipient,
        amount,
        bounce,
        payload,
        knownPayload,
      },
    });

    const signedMessage = await accountController.useTonWallet(selectedAddress, async (wallet) => {
      const contractState = await wallet.getContractState();
      if (contractState == null) {
        throw invalidRequest(req, `Failed to get contract state for ${selectedAddress}`);
      }

      let unsignedMessage: UnsignedMessage | undefined;
      try {
        unsignedMessage = wallet.prepareTransfer(
          contractState,
          password.data.publicKey,
          repackedRecipient,
          amount,
          bounce,
          body,
          60,
        );
      } finally {
        contractState.free();
      }

      if (unsignedMessage == null) {
        throw invalidRequest(req, 'Contract must be deployed first');
      }

      try {
        return await accountController.signPreparedMessage(unsignedMessage, password);
      } catch (e: any) {
        throw invalidRequest(req, e.toString());
      } finally {
        approvalController.deleteApproval(approvalId);
        unsignedMessage.free();
      }
    });

    const transaction: Transaction = await accountController.sendMessage(selectedAddress, {
      signedMessage,
      info: {
        type: 'transfer',
        data: {
          amount,
          recipient: repackedRecipient,
        },
      },
    });

    if (transaction.resultCode !== 0) {
      throw invalidRequest(req, 'Action phase failed');
    }

    res.result = {
      transaction,
    };
    end();
  };

  sendExternalMessage: ProviderMethod<'sendExternalMessage'> = async (
    req,
    res,
    _next,
    end,
    ctx,
  ) => {
    requirePermissions(ctx, ['accountInteraction']);
    requireParams(req);

    const { publicKey, recipient, stateInit, payload, local } = req.params;
    requireString(req, req.params, 'publicKey');
    requireString(req, req.params, 'recipient');
    requireOptionalString(req, req.params, 'stateInit');
    requireFunctionCall(req, req.params, 'payload');
    requireOptionalBoolean(req, req.params, 'local');

    const {
      tabId,
      origin,
      clock,
      permissionsController,
      approvalController,
      accountController,
      subscriptionsController,
    } = ctx;
    requireTabid(req, tabId);

    const allowedAccount = permissionsController.getPermissions(origin).accountInteraction;
    if (allowedAccount?.publicKey !== publicKey) {
      throw invalidRequest(req, 'Specified signer is not allowed');
    }

    const selectedPublicKey = allowedAccount.publicKey;
    let repackedRecipient: string;
    try {
      repackedRecipient = this.nt.repackAddress(recipient);
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }

    let unsignedMessage: UnsignedMessage;
    try {
      unsignedMessage = this.nt.createExternalMessage(
        clock,
        repackedRecipient,
        payload.abi,
        payload.method,
        stateInit,
        payload.params,
        selectedPublicKey,
        60,
      );
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    }

    const approvalId = nanoid();
    const password = await approvalController.addAndShowApprovalRequest({
      origin,
      id: approvalId,
      type: 'callContractMethod',
      requestData: {
        publicKey: selectedPublicKey,
        recipient: repackedRecipient,
        payload,
      },
    });

    let signedMessage: SignedMessage;
    try {
      unsignedMessage.refreshTimeout(clock);
      signedMessage = await accountController.signPreparedMessage(unsignedMessage, password);
    } catch (e: any) {
      throw invalidRequest(req, e.toString());
    } finally {
      unsignedMessage.free();
      approvalController.deleteApproval(approvalId);
    }

    let transaction: Transaction;
    if (local === true) {
      transaction = await subscriptionsController.sendMessageLocally(
        tabId,
        repackedRecipient,
        signedMessage,
      );
    } else {
      transaction = await subscriptionsController.sendMessage(
        tabId,
        repackedRecipient,
        signedMessage,
      );
    }

    let output: RawTokensObject | undefined;
    try {
      const decoded = this.nt.decodeTransaction(transaction, payload.abi, payload.method);
      output = decoded?.output;
    } catch (_) { // eslint-disable-line no-empty
    }

    res.result = {
      transaction,
      output,
    };
    end();
  };
}
