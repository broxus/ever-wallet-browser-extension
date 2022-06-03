import { getEnvironmentType } from '@app/background';
import { WindowInfo } from '@app/models';
import Oval from '@app/popup/assets/img/oval.svg';
import {
  ActiveTab,
  AppConfig,
  DIProvider,
  LocalizationProvider,
  RpcProvider,
  RpcStateProvider,
  setup,
} from '@app/popup/modules/shared';
import { IControllerRpcClient, makeControllerRpcClient } from '@app/popup/utils';
import {
  delay,
  Environment,
  ENVIRONMENT_TYPE_BACKGROUND,
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_POPUP,
  getUniqueId,
  PortDuplexStream,
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
  const container = await setup(connection, config);

  initializeUi(group, activeTab, container);
};

type ConnectionResult = {
  group?: string,
  connectionStream: PortDuplexStream,
};

const makeConnection = (windowType: Environment, windowId: number) => new Promise<ConnectionResult>((resolve, reject) => {
  console.log('Connecting');

  const extensionPort = browser.runtime.connect({ name: windowType });
  const connectionStream = new PortDuplexStream(extensionPort);

  const initId = getUniqueId();

  const onConnect = ({
    data,
    name,
  }: {
    data?: { id?: number; result?: WindowInfo }
    name?: string
  }) => {
    if (name !== 'controller' || typeof data !== 'object') {
      return;
    }
    if (data.id !== initId || typeof data.result !== 'object') {
      return;
    }

    extensionPort.onMessage.removeListener(onConnect);
    resolve({
      group: data.result.group,
      connectionStream,
    });
  };
  const onDisconnect = () => reject(new Error('Port closed'));

  extensionPort.onMessage.addListener(onConnect);
  extensionPort.onDisconnect.addListener(onDisconnect);

  extensionPort.postMessage({
    name: 'controller',
    data: {
      id: initId,
      jsonrpc: '2.0',
      method: 'initialize',
      params: [windowId],
    },
  });
});

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

const initializeUi = (
  group: string | undefined,
  activeTab: ActiveTab,
  container: DependencyContainer,
) => {
  const root = ReactDOM.createRoot(document.getElementById('root')!);

  root.render(
    <DIProvider value={container}>
      <LocalizationProvider>
        <RpcProvider>
          <RpcStateProvider group={group} activeTab={activeTab}>
            <App />
          </RpcStateProvider>
        </RpcProvider>
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

  return makeControllerRpcClient(mux.createStream('controller') as unknown as Duplex);
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

showLoader();

start().catch((error) => {
  showError();
  console.error(error);
});
