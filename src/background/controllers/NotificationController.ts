import browser from 'webextension-polyfill'

import { DEFAULT_NOTIFICATION_TIMEOUT } from '../constants'
import { BaseConfig, BaseController, BaseState } from './BaseController'

export type NotificationControllerConfig = BaseConfig

export type NotificationControllerState = BaseState

export interface INotification {
    title: string;
    body: string;
    link?: string;
    eventTime?: number;
    timeout?: number;
}

export class NotificationController extends BaseController<NotificationControllerConfig, NotificationControllerState> {

    private _notificationLinks = new Map<string, string>()

    constructor(config: NotificationControllerConfig, state?: NotificationControllerState) {
        super(config, state)

        this.initialize()

        browser.notifications.onClicked.addListener(notificationId => {
            const link = this._notificationLinks.get(notificationId)

            if (link) {
                browser.tabs.create({ url: link, active: true }).catch(console.error)
                browser.notifications.clear(notificationId).catch(console.error)
            }

            this._notificationLinks.delete(notificationId)
        })
    }

    public setHidden(hidden: boolean) {
        this.config.disabled = hidden
    }

    public showNotification({
        title,
        body,
        link,
        eventTime,
        timeout = DEFAULT_NOTIFICATION_TIMEOUT,
    }: INotification) {
        if (this.config.disabled) {
            return
        }

        browser.notifications
            .create({
                type: 'basic',
                title,
                message: body,
                iconUrl: `${browser.runtime.getURL('icon128.png')}`,
                eventTime,
            })
            .then(notificationId => {
                if (link) {
                    this._notificationLinks.set(notificationId, link)
                }

                if (timeout > 0) {
                    setTimeout(() => {
                        browser.notifications.clear(notificationId).catch(console.error)
                        this._notificationLinks.delete(notificationId)
                    }, timeout)
                }
            })
            .catch(console.error)
    }

}
