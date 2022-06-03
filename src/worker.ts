import { NekotonController, TriggerUiParams, WindowManager, openExtensionInBrowser } from '@app/background';
import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
  PortDuplexStream,
} from '@app/shared';
import endOfStream from 'end-of-stream';
import browser from 'webextension-polyfill';

const windowManager = new WindowManager();

let popupIsOpen: boolean = false;
let notificationIsOpen: boolean = false;
let uiIsTriggering: boolean = false;
const openNekotonTabsIDs: { [id: number]: true } = {};

const initialize = async () => {
  console.log('Setup controller');

  browser.runtime.onConnect.addListener(connectRemote); // TODO: move to upper scope
  browser.runtime.onConnectExternal.addListener(connectExternal);

  let controller: NekotonController | undefined;
  const controllerPromise = NekotonController.load({
    windowManager,
    openExternalWindow: triggerUi,
    getOpenNekotonTabIds: () => openNekotonTabsIDs,
  }).then((createdController: NekotonController) => {
    controller = createdController;
    return controller;
  });

  const nekotonInternalProcessHash: { [type: string]: true } = {
    [ENVIRONMENT_TYPE_POPUP]: true,
    [ENVIRONMENT_TYPE_NOTIFICATION]: true,
    [ENVIRONMENT_TYPE_FULLSCREEN]: true,
  };

  function connectRemote(remotePort: browser.Runtime.Port) {
    const processName = remotePort.name;

    const isNekotonInternalProcess = nekotonInternalProcessHash[processName];

    console.log('On remote connect', processName);

    if (isNekotonInternalProcess) {
      const portStream = new PortDuplexStream(remotePort);

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
          const tabId = remotePort.sender?.tab?.id;
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

      if (remotePort.sender == null) {
        proceedConnect();
      } else if (controller) {
        controller.setupTrustedCommunication(portStream, remotePort.sender);
        proceedConnect();
      } else {
        const sender = remotePort.sender;
        controllerPromise.then((controller: NekotonController) => {
          controller.setupTrustedCommunication(portStream, sender);
          proceedConnect();
        });
      }
    } else {
      connectExternal(remotePort);
    }
  }

  function connectExternal(remotePort: browser.Runtime.Port) {
    console.debug('connectExternal');
    const portStream = new PortDuplexStream(remotePort);
    if (remotePort.sender && controller) {
      controller.setupUntrustedCommunication(portStream, remotePort.sender);
    } else if (remotePort.sender) {
      const sender = remotePort.sender;
      controllerPromise.then((controller: NekotonController) => {
        controller.setupUntrustedCommunication(portStream, sender);
      });
    }
  }
};

const triggerUi = async (params: TriggerUiParams) => {
  let firstAttempt = true;
  while (true) {
    const tabs = await browser.tabs.query({ active: true });

    const currentlyActiveNekotonTab = Boolean(
      tabs.find((tab) => tab.id != null && openNekotonTabsIDs[tab.id]),
    );

    if (!uiIsTriggering && (params.force || !popupIsOpen) && !currentlyActiveNekotonTab) {
      uiIsTriggering = true;
      try {
        return await windowManager.showPopup({
          group: params.group,
          width: params.width,
          height: params.height,
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
};

const ensureInitialized = initialize().catch(console.error);

browser.runtime.onInstalled.addListener(({ reason }) => {
  console.log(`[Worker] onInstalled: ${reason}`);
  if (reason === 'install' && process.env.NODE_ENV === 'production') {
    ensureInitialized.then(() => openExtensionInBrowser()).catch(console.error);
  }
});
