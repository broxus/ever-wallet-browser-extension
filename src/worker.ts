import {
  NekotonController,
  openExtensionInBrowser,
  WindowManager,
} from '@app/background';
import { TriggerUiParams } from '@app/models';
import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
  PortDuplexStream,
  SimplePort,
} from '@app/shared';
import endOfStream from 'end-of-stream';
import browser from 'webextension-polyfill';

let popupIsOpen: boolean = false;
let notificationIsOpen: boolean = false;
let uiIsTriggering: boolean = false;
const openNekotonTabsIDs: { [id: number]: true } = {};

async function initialize() {
  console.log('Setup controller');

  const windowManager = await WindowManager.load();
  const controller = await NekotonController.load({
    windowManager,
    openExternalWindow: triggerUi,
    getOpenNekotonTabIds: () => openNekotonTabsIDs,
  });

  const nekotonInternalProcessHash: { [type: string]: true } = {
    [ENVIRONMENT_TYPE_POPUP]: true,
    [ENVIRONMENT_TYPE_NOTIFICATION]: true,
    [ENVIRONMENT_TYPE_FULLSCREEN]: true,
  };

  return {
    connectRemote,
    connectExternal,
  };

  function connectRemote(port: browser.Runtime.Port) {
    const processName = port.name;
    const isNekotonInternalProcess = nekotonInternalProcessHash[processName];

    console.log('On remote connect', processName);

    if (isNekotonInternalProcess) {
      const portStream = new PortDuplexStream(
        new SimplePort(port),
      );

      const proceedConnect = () => {
        if (processName === ENVIRONMENT_TYPE_POPUP) {
          popupIsOpen = true;
          endOfStream(portStream, () => {
            popupIsOpen = false;
          });
        } else if (processName === ENVIRONMENT_TYPE_NOTIFICATION) {
          notificationIsOpen = true;
          endOfStream(portStream, () => {
            notificationIsOpen = false;
          });
        } else if (processName === ENVIRONMENT_TYPE_FULLSCREEN) {
          const tabId = port.sender?.tab?.id;
          if (tabId != null) {
            openNekotonTabsIDs[tabId] = true;
          }
          endOfStream(portStream, () => {
            if (tabId != null) {
              delete openNekotonTabsIDs[tabId];
            }
          });
        }
      };

      if (!port.sender) {
        proceedConnect();
      } else {
        controller.setupTrustedCommunication(portStream, port.sender);
        port.postMessage({ name: 'ready' });
        proceedConnect();
      }
    } else {
      connectExternal(port);
    }
  }

  function connectExternal(port: browser.Runtime.Port) {
    console.debug('connectExternal');
    const portStream = new PortDuplexStream(
      new SimplePort(port),
    );

    if (port.sender) {
      controller.setupUntrustedCommunication(portStream, port.sender);
      port.postMessage({ name: 'ready' });
    }
  }

  async function triggerUi(params: TriggerUiParams) {
    let firstAttempt = true;
    while (true) {
      const tabs = await browser.tabs.query({ active: true });
      const currentlyActiveNekotonTab = !!tabs.find((tab) => tab.id != null && openNekotonTabsIDs[tab.id]);

      if (!uiIsTriggering && (params.force || !popupIsOpen) && !currentlyActiveNekotonTab) {
        uiIsTriggering = true;
        try {
          return await windowManager.showPopup({
            group: params.group,
            width: params.width,
            height: params.height,
            singleton: params.singleton,
          });
        } catch (e) {
          if (firstAttempt) {
            firstAttempt = false;
          } else {
            throw e;
          }
        } finally {
          uiIsTriggering = false;
        }
      } else {
        return undefined;
      }
    }
  }
}

const ensureInitialized = initialize();

browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install' && process.env.NODE_ENV === 'production') {
    ensureInitialized.then(() => openExtensionInBrowser()).catch(console.error);
  }
});

// Prevent service worker temination
browser.runtime.onConnect.addListener((port) => {
  ensureInitialized.then(({ connectRemote }) => connectRemote(port)).catch(console.error);
});

browser.runtime.onConnectExternal.addListener((port) => {
  ensureInitialized.then(({ connectExternal }) => connectExternal(port)).catch(console.error);
});

browser.alarms.onAlarm.addListener((alarm) => {
  ensureInitialized.catch(console.error);
});

// check for new transactions every 60 sec
browser.alarms.create({ periodInMinutes: 1 });
