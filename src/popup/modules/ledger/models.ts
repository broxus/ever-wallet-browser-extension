import { RpcEvent } from '@app/models'

export interface LedgerRpcEvent {
    type: 'ledger';
    data: {
        result: 'connected' | 'failed'
    };
}

export function isLedgerRpcEvent(value: RpcEvent): value is LedgerRpcEvent {
    return typeof value === 'object' && value.type === 'ledger'
}
