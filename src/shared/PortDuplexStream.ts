import { Buffer } from 'buffer';
import { Duplex } from 'readable-stream';
import type { Runtime } from 'webextension-polyfill';

export class PortDuplexStream extends Duplex {
  private port: Runtime.Port | chrome.runtime.Port;

  constructor(port: Runtime.Port | chrome.runtime.Port) {
    super({ objectMode: true });
    this.port = port;
    this.port.onMessage.addListener((msg: unknown) => this._onMessage(msg));
    this.port.onDisconnect.addListener(() => {
      console.log('[PortDuplexStream] onDisconnect');
      this._onDisconnect();
    });
  }

  private _onMessage(msg: unknown) {
    if (Buffer.isBuffer(msg)) {
      const data: Buffer = Buffer.from(msg);
      this.push(data);
    } else {
      this.push(msg);
    }
  }

  private _onDisconnect() {
    // TODO: check
    this.end(() => {
      this.destroy();
    });
  }

  _read() {
    return undefined;
  }

  _write(message: unknown, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    try {
      if (Buffer.isBuffer(message)) {
        const data: Record<string, unknown> = message.toJSON();
        data._isBuffer = true;
        this.port.postMessage(data);
      } else {
        this.port.postMessage(message);
      }
    } catch (e: any) {
      return callback(new Error('[PortDuplexStream] - disconnected'));
    }
    return callback();
  }
}
