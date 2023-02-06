import type { LedgerSignatureContext } from '@broxus/ever-wallet-wasm'

export interface LedgerAccount {
    publicKey: string;
    index: number;
}

export type IBridgeApi = {
    'ledger-get-public-key': {
        input: {
            account: number
        }
        output: {
            publicKey: Uint8Array
            error: Error
        }
    }
    'ledger-sign-message': {
        input: {
            account: number
            chainId: number | undefined
            message: Uint8Array
        }
        output: {
            signature: Uint8Array
            error: Error
        }
    }
    'ledger-sign-transaction': {
        input: {
            account: number
            wallet: number
            originalWallet: number
            chainId: number | undefined
            message: Uint8Array
            context?: LedgerSignatureContext
        }
        output: {
            signature: Uint8Array
            error: Error
        }
    }
    'ledger-get-address': {
        input: {
            account: number
            contract: number
        }
        output: {
            address: Uint8Array
            error: Error
        }
    }
    'ledger-close-bridge': {
        input: {}
        output: {}
    }
};

export type IBridgeResponse<T extends keyof IBridgeApi> =
    {
        success: true
        payload: IBridgeApi[T]['output']
        error: undefined
    } |
    {
        success: false;
        payload: undefined;
        error: Error | undefined
    };
