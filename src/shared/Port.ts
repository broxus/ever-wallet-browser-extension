import { EventEmitter } from 'events';
import type browser from 'webextension-polyfill';

export interface Port {
  readonly onMessage: SimpleEvent<(message: any) => void>;
  readonly onDisconnect: SimpleEvent<() => void>;
  postMessage(message: any): Promise<void>;
}

interface SimpleEvent<T extends Function> {
  addListener(callback: T): void;
  removeListener(callback: T): void;
}

export interface AsyncPortFactory {
  (): Promise<browser.Runtime.Port | chrome.runtime.Port>;
}

export class SimplePort implements Port {
  constructor(private port: browser.Runtime.Port | chrome.runtime.Port) {
  }

  onDisconnect = this.port.onDisconnect;
  onMessage = this.port.onMessage;

  postMessage(message: any): Promise<void> {
    return Promise.resolve(
      this.port.postMessage(message),
    );
  }
}

type ExtensionPort = browser.Runtime.Port | chrome.runtime.Port;

export class ReconnectablePort implements Port {
  private disconnected = false;
  private port: Promise<ExtensionPort | undefined>;
  private emitter = new EventEmitter();

  constructor(
    port: ExtensionPort,
    private factory: AsyncPortFactory,
  ) {
    this.port = Promise.resolve(port);
    this.setupEvents(port);
  }

  get onDisconnect() {
    return {
      addListener: (callback: any) => this.emitter.on('disconnect', callback),
      removeListener: (callback: any) => this.emitter.off('disconnect', callback),
    };
  }

  get onMessage() {
    return {
      addListener: (callback: any) => this.emitter.on('message', callback),
      removeListener: (callback: any) => this.emitter.off('message', callback),
    };
  }

  async postMessage(message: any): Promise<void> {
    const port = await this.port;

    if (!port) {
      console.log(`[ReconnectablePort] unable to post message; disconnected: ${this.disconnected}`);
    }

    port?.postMessage(message);
  }

  private async getPort(): Promise<ExtensionPort | undefined> {
    if (this.disconnected) return undefined;

    let port: ExtensionPort | undefined;

    try {
      port = await this.factory();
      this.setupEvents(port);
    } catch (e) {
      console.debug('[ReconnectablePort] port factory error', e);
      this.disconnect();
    }

    return port;
  }

  private setupEvents(port: ExtensionPort) {
    port.onMessage.addListener((message) => this.emitter.emit('message', message));
    port.onDisconnect.addListener(() => this.reconnect());
  }

  private reconnect() {
    console.debug('[ReconnectablePort] reconnecting');
    this.port = this.getPort();
  }

  private disconnect() {
    console.debug('[ReconnectablePort] disconnect');
    this.disconnected = true;
    this.port = Promise.resolve(undefined);
    this.emitter.emit('disconnect');
  }
}
