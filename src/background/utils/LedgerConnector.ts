import type { LedgerQueryResultHandler, LedgerSignatureContext } from 'nekoton-wasm';
import { LedgerBridge } from '../ledger/LedgerBridge';

export class LedgerConnector {
  constructor(private readonly bridge: LedgerBridge) {
  }

  async getPublicKey(account: number, handler: LedgerQueryResultHandler) {
    await this.bridge
      .getPublicKey(account)
      .then((publicKey) => {
        handler.onResult(publicKey);
      })
      .catch((err) => {
        handler.onError(err.message);
      });
  }

  async sign(
    account: number,
    message: Buffer,
    context: LedgerSignatureContext,
    handler: LedgerQueryResultHandler,
  ) {
    await this.bridge
      .signHash(account, new Uint8Array(message), context)
      .then((signature) => {
        handler.onResult(signature);
      })
      .catch((err) => {
        handler.onError(err.message);
      });
  }
}
