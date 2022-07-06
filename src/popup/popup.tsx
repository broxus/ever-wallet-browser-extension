import { getEnvironmentType } from '@app/background';
import { WindowInfo } from '@app/models';
import Oval from '@app/popup/assets/img/oval.svg';
import { ActiveTab, AppConfig, DIProvider, LocalizationProvider, setup } from '@app/popup/modules/shared';
import { ControllerState, IControllerRpcClient, LedgerRpcServer, makeControllerRpcClient } from '@app/popup/utils';
import {
  delay,
  Environment,
  ENVIRONMENT_TYPE_BACKGROUND,
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_POPUP,
  getUniqueId,
  KEEP_ALIVE_INTERVAL,
  KEEP_ALIVE_PORT,
  KEEP_ALIVE_TIMEOUT,
  PortDuplexStream,
  ReconnectablePort,
} from '@app/shared';
import ObjectMultiplex from 'obj-multiplex';
import pump from 'pump';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Duplex } from 'readable-stream';
import { DependencyContainer } from 'tsyringe';
import browser from 'webextension-polyfill';
import App from './App';

const start = async () => {
  const windowType = getEnvironmentType();
  console.log('Window type', windowType);

  const tryConnect = async () => {
    const windowId = (await browser.windows.getCurrent()).id!;

    while (true) {
      try {
        return await makeConnection(windowType, windowId);
      } catch (e: any) {
        console.error(e);
        await delay(1000);
      }
    }
  };

  const { group, connectionStream } = await tryConnect();

  console.log('Connected');

  const activeTab = await queryCurrentActiveTab(windowType);
  const connection = connectToBackground(connectionStream);
  const config = new AppConfig(group, activeTab);
  const state = await connection.getState();

  if (await validateState(activeTab, state, connection)) {
    await initializeUi(
      await setup(connection, state, config),
    );
  }
};

async function validateState(activeTab: ActiveTab, state: ControllerState, rpc: IControllerRpcClient): Promise<boolean> {
  const isFullscreen = activeTab?.type === 'fullscreen';
  const isNotification = activeTab?.type === 'notification';
  const isPopup = activeTab?.type === 'popup';

  if (!activeTab) {
    window.close();
    return false;
  }
  if (!state.selectedAccount && (isPopup || isNotification)) {
    await rpc.openExtensionInBrowser({});
    window.close();
    return false;
  }
  if (state.selectedAccount && isFullscreen && !activeTab.data?.route) {
    window.close();
    return false;
  }

  return true;
}

type ConnectionResult = {
  group?: string,
  connectionStream: PortDuplexStream,
};

async function makeConnection(windowType: Environment, windowId: number) {
  console.log('Connecting');

  const port = await openWorkerPort(windowType);
  const initId = getUniqueId();

  return new Promise<ConnectionResult>((resolve, reject) => {
    const onMessage = (message: { data?: { id?: number; result?: WindowInfo }, name?: string }) => {
      const { data, name } = message;

      if (name === 'controller' && data?.id === initId && typeof data?.result === 'object') {
        const { group } = data.result;
        const connectionStream = new PortDuplexStream(
          new ReconnectablePort(port, () => openWorkerPort(windowType)),
        );

        port.onMessage.removeListener(onMessage);
        port.onDisconnect.removeListener(onDisconnect);

        resolve({ group, connectionStream });
      }
    };
    const onDisconnect = () => reject(new Error('Port closed'));

    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener(onDisconnect);

    port.postMessage({
      name: 'controller',
      data: {
        id: initId,
        jsonrpc: '2.0',
        method: 'initialize',
        params: [windowId],
      },
    });
  });
}

function openWorkerPort(name: Environment): Promise<browser.Runtime.Port> {
  const port = browser.runtime.connect({ name });

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

const queryCurrentActiveTab = async (windowType: Environment) => new Promise<ActiveTab>((resolve) => {
  if (windowType === ENVIRONMENT_TYPE_FULLSCREEN) {
    const route = window.location.hash.replace('#', '');

    resolve({
      type: windowType,
      data: {
        route: route !== '' ? route : undefined,
      },
    });
    return;
  }

  if (windowType !== ENVIRONMENT_TYPE_POPUP) {
    resolve({ type: windowType } as any);
    return;
  }

  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      const [activeTab] = tabs;
      const { id, title, url } = activeTab;
      // eslint-disable-next-line no-nested-ternary
      const { origin, protocol } = url ?
        !url.startsWith('about:') ?
          new URL(url) :
          { origin: 'about', protocol: undefined } :
        { origin: undefined, protocol: undefined };

      // eslint-disable-next-line eqeqeq
      if (!origin || origin == 'null') {
        resolve({ type: ENVIRONMENT_TYPE_BACKGROUND } as any);
        return;
      }

      resolve({ type: windowType, data: { id, title, origin, protocol, url } });
    })
    .catch(console.error);
});

const initializeUi = (container: DependencyContainer) => {
  const root = ReactDOM.createRoot(document.getElementById('root')!);

  root.render(
    <DIProvider value={container}>
      <LocalizationProvider>
        <App />
      </LocalizationProvider>
    </DIProvider>,
  );
};

const connectToBackground = (connectionStream: Duplex): IControllerRpcClient => {
  const mux = new ObjectMultiplex();

  pump(connectionStream, mux, connectionStream, (error) => {
    if (error) {
      console.error(error);
    }
  });

  const ledgerRpcServer = new LedgerRpcServer(mux.createStream('ledger'));

  return makeControllerRpcClient(mux.createStream('controller'));
};

function showLoader() {
  const root = document.getElementById('root');

  if (root) {
    root.innerHTML = `<div class="loader-page"><img src="${Oval}" class="loader-page__spinner" alt="" /></div>`;
  }
}

function showError() {
  const root = document.getElementById('root');

  if (root) {
    root.innerHTML = '<div class="critical-error">The Nekoton app failed to load: please open and close Nekoton again to restart.</div>';
    root.style.height = '80px';
  }
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

showLoader();
startKeepAlive();

start()
  .catch((error) => {
    showError();
    console.error(error);
  });
