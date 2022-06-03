import {
  Environment,
  ENVIRONMENT_TYPE_BACKGROUND,
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '@app/shared';
import memoize from 'lodash.memoize';
import browser, { Tabs, Windows } from 'webextension-polyfill';

export const focusTab = (tabId: number | string): Promise<Tabs.Tab> => browser.tabs.update(+tabId, { active: true });

export const focusWindow = (id: number): Promise<Windows.Window> => browser.windows.update(id, { focused: true });

export const getLastFocused = (): Promise<Windows.Window> => browser.windows.getLastFocused();

export const getAllWindows = (): Promise<Windows.Window[]> => browser.windows.getAll();

export const openExtensionInBrowser = async (route?: string, query?: string) => {
  let extensionUrl = browser.runtime.getURL('home.html');
  if (query) {
    extensionUrl += `?${query}`;
  }
  if (route) {
    extensionUrl += `#${route}`;
  }

  await browser.tabs.create({ url: extensionUrl });
};

export const closeCurrentWindow = () => browser.windows.getCurrent()
  .then(async (windowDetails) => {
    if (windowDetails.id != null) {
      await browser.windows.remove(windowDetails.id);
    }
  })
  .catch(console.error);

const getEnvironmentTypeCached = memoize((url): Environment => {
  const parseUrl = new URL(url);
  if (parseUrl.pathname === '/popup.html') {
    return ENVIRONMENT_TYPE_POPUP;
  }
  if (parseUrl.pathname === '/notification.html') {
    return ENVIRONMENT_TYPE_NOTIFICATION;
  }
  if (parseUrl.pathname === '/home.html') {
    return ENVIRONMENT_TYPE_FULLSCREEN;
  }
  return ENVIRONMENT_TYPE_BACKGROUND;
});

export const getEnvironmentType = (url = window.location.href) => getEnvironmentTypeCached(url);
