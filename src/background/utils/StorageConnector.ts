import type { StorageQueryHandler, StorageQueryResultHandler } from 'nekoton-wasm';
import browser from 'webextension-polyfill';

export class StorageConnector {
  get(key: string, handler: StorageQueryResultHandler) {
    browser.storage.local
      .get(key)
      .then((items) => {
        handler.onResult(items[key]);
      })
      .catch((e) => handler.onError(e));
  }

  set(key: string, value: string, handler: StorageQueryHandler) {
    browser.storage.local
      .set({ [key]: value })
      .then(() => {
        handler.onResult();
      })
      .catch((e) => handler.onError(e));
  }

  setUnchecked(key: string, value: string) {
    browser.storage.local.set({ [key]: value }).catch(console.error);
  }

  remove(key: string, handler: StorageQueryHandler) {
    browser.storage.local
      .remove([key])
      .then(() => {
        handler.onResult();
      })
      .catch((e) => handler.onError(e));
  }

  removeUnchecked(key: string) {
    browser.storage.local.remove([key]).catch(console.error);
  }
}
