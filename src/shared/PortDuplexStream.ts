import { Buffer } from 'buffer';
import { Duplex } from 'readable-stream';
import type { Port } from './Port';

export class PortDuplexStream extends Duplex {
  constructor(private port: Port) {
    super({ objectMode: true });

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
    this.end(() => {
      this.destroy();
    });
  }

  _read() {
    return undefined;
  }

  async _write(message: unknown, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    try {
      if (Buffer.isBuffer(message)) {
        const data: Record<string, unknown> = message.toJSON();
        data._isBuffer = true;
        await this.port.postMessage(data);
      } else {
        await this.port.postMessage(message);
      }
    } catch (e: any) {
      return callback(new Error('[PortDuplexStream] - disconnected'));
    }
    return callback();
  }
}
