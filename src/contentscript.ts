import { KEEP_ALIVE_INTERVAL, KEEP_ALIVE_PORT, KEEP_ALIVE_TIMEOUT, ReconnectablePort } from '@app/shared';
import { CONTENT_SCRIPT, INPAGE_SCRIPT, NEKOTON_PROVIDER } from '@app/shared/constants';
import { PortDuplexStream } from '@app/shared/PortDuplexStream';
import ObjectMultiplex from 'obj-multiplex';
import LocalMessageDuplexStream from 'post-message-stream';
import pump from 'pump';
import browser from 'webextension-polyfill';

const logStreamDisconnectWarning = (remoteLabel: string, error?: Error) => {
  console.debug(`Nekoton: Content script lost connection to "${remoteLabel}"`, error);
};

const checkDoctype = () => {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
};

const checkSuffix = () => {
  const excludedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for (const type of excludedTypes) {
    if (type.test(currentUrl)) {
      return false;
    }
  }
  return true;
};

const checkDocumentElement = () => {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
};

function checkExcludedDomains() {
  const excludedDomains = [
    'dropbox.com',
    'atlassian.net',
    'atlassian.com',
    'broxus.github.io',
    'ozon.ru',
    'mail.ru',
  ];

  const currentUrl = window.location.href;

  let currentRegex: RegExp | undefined;
  for (let i = 0; i < excludedDomains.length; i++) {
    const blockedDomain = excludedDomains[i].replace('.', '\\.');
    currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`, 'u');

    if (!currentRegex.test(currentUrl)) {
      return false;
    }
  }

  return true;
}

const shouldInjectProvider = () => checkDoctype() && checkSuffix() && checkDocumentElement() && checkExcludedDomains();

const injectScript = () => {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('js/inpage.js');
    scriptTag.setAttribute('async', 'false');
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (e: any) {
    console.error('Nekoton: Provider injection failed', e);
  }
};

const forwardTrafficBetweenMutexes = (
  channelName: string,
  a: ObjectMultiplex,
  b: ObjectMultiplex,
) => {
  const channelA = a.createStream(channelName);
  const channelB = b.createStream(channelName);
  pump(channelA, channelB, channelA, (e) => {
    console.debug(`Nekoton: Muxed traffic for channel "${channelName}" failed`, e);
  });
};

const notifyInpageOfStreamFailure = () => {
  window.postMessage(
    {
      target: INPAGE_SCRIPT,
      data: {
        name: NEKOTON_PROVIDER,
        data: {
          jsonrpc: '2.0',
          method: 'NEKOTON_STREAM_FAILURE',
        },
      },
    },
    window.location.origin,
  );
};

const setupStreams = async () => {
  const pageStream = new LocalMessageDuplexStream({
    name: CONTENT_SCRIPT,
    target: INPAGE_SCRIPT,
  });
  const port = await openWorkerPort();
  const extensionStream = new PortDuplexStream(
    new ReconnectablePort(port, () => openWorkerPort()),
  );

  const pageMux = new ObjectMultiplex();
  pageMux.setMaxListeners(25);
  const extensionMux = new ObjectMultiplex();
  extensionMux.setMaxListeners(25);

  pump(pageMux, pageStream, pageMux, (e) => {
    logStreamDisconnectWarning('Nekoton inpage multiplex', e);
  });
  pump(extensionMux, extensionStream, extensionMux, (e) => {
    logStreamDisconnectWarning('Nekoton background multiplex', e);
    notifyInpageOfStreamFailure();
  });
  forwardTrafficBetweenMutexes(NEKOTON_PROVIDER, pageMux, extensionMux);
};

function openWorkerPort(): Promise<chrome.runtime.Port> {
  const port = chrome.runtime.connect({ name: CONTENT_SCRIPT });

  return new Promise((resolve, reject) => {
    const onMessage = (message: any) => {
      if (message?.name === 'ready') {
        port.onMessage.removeListener(onMessage);
        port.onDisconnect.removeListener(onDisconnect);

        resolve(port);
      }
    };
    const onDisconnect = () => reject();

    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener(onDisconnect);
  });
}

function startKeepAlive() {
  // Prevent service worker temination
  const port = browser.runtime.connect({ name: KEEP_ALIVE_PORT });

  port.onMessage.addListener((message) => console.debug(message));
  port.onDisconnect.addListener(() => {
    clearInterval(interval);
    clearTimeout(timeout);
    setTimeout(startKeepAlive, 1000);
  });

  const interval = setInterval(() => {
    port.postMessage({ name: 'keepalive' });
  }, KEEP_ALIVE_INTERVAL);

  const timeout = setTimeout(() => {
    clearInterval(interval);
    port.disconnect();
    startKeepAlive();
  }, KEEP_ALIVE_TIMEOUT);
}

if (shouldInjectProvider()) {
  injectScript();
  setupStreams();
  startKeepAlive();
}
