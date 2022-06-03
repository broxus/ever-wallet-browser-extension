import { JsonRpcError } from '@app/shared';
import safeStringify from 'fast-safe-stringify';

export enum RpcErrorCode {
  INTERNAL,
  TRY_AGAIN_LATER,
  INVALID_REQUEST,
  RESOURCE_UNAVAILABLE,
  METHOD_NOT_FOUND,
  INSUFFICIENT_PERMISSIONS,
  REJECTED_BY_USER,
  CONNECTION_IS_NOT_INITIALIZED,
  MESSAGE_EXPIRED,
}

export const errorMessages: { [K in RpcErrorCode]: string } = {
  [RpcErrorCode.INTERNAL]: 'Internal error',
  [RpcErrorCode.TRY_AGAIN_LATER]: 'Try again later',
  [RpcErrorCode.INVALID_REQUEST]: 'Invalid request',
  [RpcErrorCode.RESOURCE_UNAVAILABLE]: 'Resource unavailable',
  [RpcErrorCode.METHOD_NOT_FOUND]: 'Method not found',
  [RpcErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permission',
  [RpcErrorCode.REJECTED_BY_USER]: 'Rejected by user',
  [RpcErrorCode.CONNECTION_IS_NOT_INITIALIZED]: 'Connection is not initialized',
  [RpcErrorCode.MESSAGE_EXPIRED]: 'Message expired',
};

export class NekotonRpcError<T> extends Error {
  code: number;
  data?: T;

  constructor(code: number, message: string, data?: T) {
    if (!Number.isInteger(code)) {
      throw new Error('"code" must be an integer');
    }

    if (!message || (typeof message as any) !== 'string') {
      throw new Error('"message" must be a nonempty string');
    }

    super(message);

    this.code = code;
    this.data = data;
  }

  serialize(): JsonRpcError {
    const serialized: JsonRpcError = {
      code: this.code,
      message: this.message,
    };
    if (this.data !== undefined) {
      serialized.data = this.data;
    }
    if (this.stack) {
      serialized.stack = this.stack;
    }
    return serialized;
  }

  toString(): string {
    return safeStringify(this.serialize(), this.stringifyReplacer, 2);
  }

  private stringifyReplacer(_: unknown, value: unknown): unknown {
    if (value === '[Circular]') {
      return undefined;
    }
    return value;
  }
}
