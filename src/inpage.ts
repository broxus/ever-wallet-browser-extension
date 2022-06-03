/* eslint-disable */
(window as Record<string, any>).__hasEverscaleProvider = true;

// TODO: remove in future
(window as Record<string, any>).hasTonProvider = true;

let __define: any;

const cleanContextForImports = () => {
  __define = (window as any).define;
  try {
    (window as any).define = undefined;
  } catch (_) {
    console.warn('Nekoton: global.define could not be deleted');
  }
};

const restoreContextAfterImports = () => {
  try {
    (window as any).define = __define;
  } catch (_) {
    console.warn('Nekoton: global.define could not be overwritten');
  }
};

cleanContextForImports();

import log from 'loglevel';
import LocalMessageDuplexStream from 'post-message-stream';
import { CONTENT_SCRIPT, INPAGE_SCRIPT } from '@app/shared/constants';
import { initializeProvider } from './provider/initializeProvider';

restoreContextAfterImports();

log.setDefaultLevel(process.env.NODE_ENV !== 'production' ? 'debug' : 'warn');

const nekotonStream = new LocalMessageDuplexStream({
  name: INPAGE_SCRIPT,
  target: CONTENT_SCRIPT,
});

initializeProvider({
  connectionStream: nekotonStream,
  logger: log,
});
