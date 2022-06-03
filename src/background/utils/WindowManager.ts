import browser, { Windows } from 'webextension-polyfill';
import { focusWindow, getAllWindows, getLastFocused } from './platform';

const NOTIFICATION_HEIGHT = 620;
const NOTIFICATION_WIDTH = 400;

export class WindowManager {
  private groups: { [group: string]: number } = {};
  private popups: { [popup: number]: string } = {};

  public getGroup(windowId: number): string | undefined {
    return this.popups[windowId] as string | undefined;
  }

  public async showPopup(params: ShowPopupParams) {
    const popup = await this.getPopup(params.group);

    if (popup != null && popup.id != null) {
      await focusWindow(popup.id);
      return;
    }

    let left = 0;
    let top = 0;
    const width = params.width || NOTIFICATION_WIDTH;
    const height = params.height || NOTIFICATION_HEIGHT;

    try {
      const lastFocused = await getLastFocused();
      top = ((lastFocused.top || top) + ((lastFocused.height || 0) - height) / 2) | 0;
      left = ((lastFocused.left || left) + ((lastFocused.width || 0) - width) / 2) | 0;
    } catch (e) {
      const { screenX, screenY, outerWidth } = window;
      top = Math.max(screenY, 0);
      left = Math.max(screenX + (outerWidth - width), 0);
    }

    const popupWindow = await browser.windows.create({
      url: 'notification.html',
      type: 'popup',
      width,
      height,
      left,
      top,
    });

    if (popupWindow == null) {
      throw Error('NotificationManager: Failed to create popup window');
    }

    if (popupWindow.id != null) {
      if (popupWindow.left !== left && popupWindow.state !== 'fullscreen') {
        await browser.windows.update(popupWindow.id, { left, top });
      }

      this.groups[params.group] = popupWindow.id;
      this.popups[popupWindow.id] = params.group;
    }
  }

  private async getPopup(group: string) {
    const popupId = this.groups[group] as number | undefined;
    let result: Windows.Window | undefined;

    const newGroups: Record<string, number> = {};
    const newPopups: Record<number, string> = {};

    const windows = await getAllWindows();
    for (const window of windows) {
      if (window.type !== 'popup' || window.id == null) {
        continue;
      }

      const existingGroup = this.popups[window.id] as string | undefined;
      if (existingGroup != null) {
        newGroups[existingGroup] = window.id;
        newPopups[window.id] = existingGroup;
      }

      if (window.id === popupId) {
        result = window;
      }
    }

    this.groups = newGroups;
    this.popups = newPopups;

    return result;
  }
}

interface ShowPopupParams {
  group: string;
  width?: number;
  height?: number;
}
