import browser, { Windows } from 'webextension-polyfill'
import log from 'loglevel'

import type { WindowGroup } from '@app/models'
import { focusWindow, getAllWindows, getLastFocused } from '@app/shared'

const NOTIFICATION_HEIGHT = 620
const NOTIFICATION_WIDTH = 400

export class WindowManager {

    public static async load(): Promise<WindowManager> {
        const instance = new WindowManager()
        await instance.loadData()
        return instance
    }

    private popups: Record<number, Popup> = {}

    public getGroup(windowId: number): WindowGroup | undefined {
        return this.popups[windowId]?.group
    }

    public async showPopup(params: ShowPopupParams) {
        const {
            group,
            owner,
            width = NOTIFICATION_WIDTH,
            height = NOTIFICATION_HEIGHT,
        } = params

        const popup = await this.getPopup(group, owner)

        if (popup != null && popup.id != null) {
            await focusWindow(popup.id)
            return
        }

        let left = 0,
            top = 0

        try {
            const lastFocused = await getLastFocused()
            top = Math.floor((lastFocused.top || top) + ((lastFocused.height || 0) - height) / 2)
            left = Math.floor((lastFocused.left || left) + ((lastFocused.width || 0) - width) / 2)
        }
        catch (e) {
            const { screenX, screenY, outerWidth } = window
            top = Math.max(screenY, 0)
            left = Math.max(screenX + (outerWidth - width), 0)
        }

        const popupWindow = await browser.windows.create({
            url: 'notification.html',
            type: 'popup',
            width,
            height,
            left,
            top,
        })

        if (popupWindow == null) {
            throw Error('NotificationManager: Failed to create popup window')
        }

        if (popupWindow.id !== undefined) {
            if (popupWindow.left !== left && popupWindow.state !== 'fullscreen') {
                await browser.windows.update(popupWindow.id, { left, top })
            }

            this.popups[popupWindow.id] = { windowId: popupWindow.id, group, owner }

            await this.updateData()
        }
    }

    private async getPopup(group: WindowGroup, owner?: string): Promise<Windows.Window | undefined> {
        const ids = new Set(Object.values(this.popups).map((p) => p.windowId))
        let result: Windows.Window | undefined

        try {
            // wait for the previous popup to be closed in content script
            await new Promise((r) => { setTimeout(r, 100) })

            const windows = await getAllWindows()
            for (const window of windows) {
                if (window.type !== 'popup' || window.id === undefined) {
                    continue
                }

                const popup = this.popups[window.id]

                if (popup && popup.group === group && popup.owner === owner) {
                    result = window
                }

                ids.delete(window.id)
            }

            for (const id of ids) {
                delete this.popups[id]
            }
            await this.updateData()
        }
        catch (e) {
            log.error(e)
        }

        return result
    }

    private async loadData() {
        try {
            const { windowManagerData } = await browser.storage.local.get('windowManagerData')
            const ids = (await browser.windows.getAll()).map(({ id }) => id)
            const popups = windowManagerData?.popups ?? {}

            // fallback, remove in future
            for (const [key, value] of Object.entries(popups)) {
                if (typeof value === 'string') {
                    popups[key] = {
                        windowId: parseInt(key, 10),
                        group: value,
                    }
                }
            }

            for (const key of Object.keys(popups)) {
                const id = parseInt(key, 10)
                if (!ids.includes(id)) { // remove item if window not found
                    delete popups[key]
                }
            }


            this.popups = popups
        }
        catch (e) {
            log.error(e)
        }
    }

    private async updateData() {
        try {
            await browser.storage.local.set({
                windowManagerData: {
                    popups: this.popups,
                },
            })
        }
        catch (e) {
            log.error(e)
        }
    }

}

interface ShowPopupParams {
    group: WindowGroup;
    width?: number;
    height?: number;
    owner?: string;
}

interface Popup {
    windowId: number;
    group: WindowGroup;
    owner?: string;
}
