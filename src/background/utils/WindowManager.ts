import browser, { Windows } from 'webextension-polyfill'

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

    private groups: { [key in WindowGroup]?: number } = {}

    private popups: Record<number, WindowGroup> = {}

    public getGroup(windowId: number): WindowGroup | undefined {
        return this.popups[windowId]
    }

    public async showPopup(params: ShowPopupParams) {
        const {
            group,
            singleton = true,
            width = NOTIFICATION_WIDTH,
            height = NOTIFICATION_HEIGHT,
        } = params

        if (singleton) {
            const popup = await this.getPopup(group)

            if (popup != null && popup.id != null) {
                await focusWindow(popup.id)
                return
            }
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

        if (popupWindow.id != null) {
            if (popupWindow.left !== left && popupWindow.state !== 'fullscreen') {
                await browser.windows.update(popupWindow.id, { left, top })
            }

            this.groups[group] = popupWindow.id
            this.popups[popupWindow.id] = group

            await this.updateData()
        }
    }

    private async getPopup(group: WindowGroup) {
        const popupId = this.groups[group]
        let result: Windows.Window | undefined

        const newGroups: { [key in WindowGroup]?: number } = {}
        const newPopups: Record<number, WindowGroup> = {}

        const windows = await getAllWindows()
        for (const window of windows) {
            if (window.type !== 'popup' || window.id == null) {
                continue
            }

            const existingGroup = this.popups[window.id] as WindowGroup | undefined
            if (existingGroup != null) {
                newGroups[existingGroup] = window.id
                newPopups[window.id] = existingGroup
            }

            if (window.id === popupId) {
                result = window
            }
        }

        this.groups = newGroups
        this.popups = newPopups

        await this.updateData()

        return result
    }

    private async loadData() {
        try {
            const { windowManagerData } = await chrome.storage.session.get('windowManagerData')

            this.groups = windowManagerData?.groups ?? {}
            this.popups = windowManagerData?.popups ?? {}
        }
        catch (e) {
            console.error(e)
        }
    }

    private async updateData() {
        try {
            await chrome.storage.session.set({
                windowManagerData: {
                    groups: this.groups,
                    popups: this.popups,
                },
            })
        }
        catch (e) {
            console.error(e)
        }
    }

}

interface ShowPopupParams {
    group: WindowGroup;
    width?: number;
    height?: number;
    singleton?: boolean;
}
