import type { LedgerSignatureContext } from 'nekoton-wasm';

const { EventEmitter } = require('events');

const BRIDGE_URL = 'https://broxus.github.io/everscale-ledger-bridge';

type IBridgeApi = {
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

type IBridgeResponse<T extends keyof IBridgeApi> =
  | {
    success: true
    payload: IBridgeApi[T]['output']
    error: undefined
  }
  | {
    success: false;
    payload: undefined;
    error: Error | undefined
  };

export class LedgerBridge extends EventEmitter {
  private readonly bridgeUrl: string = BRIDGE_URL;
  private readonly perPage = 5;
  private page: number = 0;
  private iframe?: HTMLIFrameElement;
  private iframeLoaded: boolean = false;

  // TODO: move iframe to page
  // constructor() {
  //   super();
  //   this._setupIframe();
  // }

  public getFirstPage() {
    this.page = 0;
    return this.__getPage(1);
  }

  public getNextPage() {
    return this.__getPage(1);
  }

  public getPreviousPage() {
    return this.__getPage(-1);
  }

  public async getPublicKey(account: number) {
    const { success, payload, error } = await this._sendMessage('ledger-get-public-key', {
      account,
    });

    if (success && payload) {
      return payload.publicKey;
    }

    throw error || new Error('Unknown error');
  }

  public async signHash(account: number, message: Uint8Array, context?: LedgerSignatureContext) {
    const { success, payload, error } = await this._sendMessage('ledger-sign-message', {
      account,
      message,
      context,
    });

    if (success && payload) {
      return payload.signature;
    }

    throw error || new Error('Unknown error');
  }

  public async close() {
    const { success, error } = await this._sendMessage('ledger-close-bridge', {});

    if (!success) {
      throw error || new Error('Unknown error');
    }
  }

  private _setupIframe() {
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.bridgeUrl;
    this.iframe.allow = 'hid';
    this.iframe.onload = () => {
      this.iframeLoaded = true;
    };
    document.body.appendChild(this.iframe);
  }

  private _getOrigin() {
    const tmp = this.bridgeUrl.split('/');
    tmp.splice(-1, 1);
    return tmp.join('/');
  }

  private _sendMessage<T extends keyof IBridgeApi>(
    action: T,
    params: IBridgeApi[T]['input'],
  ): Promise<IBridgeResponse<T>> {
    if (!this.iframeLoaded) throw new Error('LedgerBridge not initialized'); // TODO

    const message = {
      target: 'LEDGER-IFRAME',
      action,
      params,
    };

    return new Promise<IBridgeResponse<T>>((resolve, reject) => {
      const eventListener = ({ origin, data }: MessageEvent) => {
        if (origin !== this._getOrigin()) {
          reject(new Error('Invalid origin'));
        } else if (data?.action !== `${message.action}-reply`) {
          reject(new Error('Invalid reply'));
        } else {
          resolve(data);
        }
      };

      window.addEventListener('message', eventListener, { once: true });

      this.iframe?.contentWindow?.postMessage(message, '*');
    });
  }

  private async _getPublicKeys(from: number, to: number) {
    const publicKeys = [];
    for (let i = from; i < to; i++) {
      const publicKey = await this.getPublicKey(i);
      publicKeys.push({
        publicKey: Buffer.from(publicKey).toString('hex'),
        index: i,
      });
    }
    return publicKeys;
  }

  private async __getPage(increment: number) {
    this.page += increment;

    if (this.page <= 0) {
      this.page = 1;
    }
    const from = (this.page - 1) * this.perPage;
    const to = from + this.perPage;

    return this._getPublicKeys(from, to);
  }
}
