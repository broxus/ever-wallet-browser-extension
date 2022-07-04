import type { LedgerSignatureContext } from '@wallet/nekoton-wasm';

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
      message: Uint8Array
      context?: LedgerSignatureContext
    }
    output: {
      signature: Uint8Array
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
