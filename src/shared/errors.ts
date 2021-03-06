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
}
