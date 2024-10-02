import { singleton } from 'tsyringe'
import { createRef, MutableRefObject, ReactNode } from 'react'
import { makeAutoObservable } from 'mobx'

import { Icons } from '@app/popup/icons'

import type { NotificationRef, NotificationType } from '../components'

let globalId = 0

@singleton()
export class NotificationStore {

    private _notifications = new Map<string, Item>()

    constructor() {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get notifications(): Item[] {
        return [...this._notifications.values()]
    }

    public show(message: ReactNode, notificationId?: string): string
    public show(params: NotificationParams, notificationId?: string): string
    public show(messageOrParams: NotificationParams | ReactNode, notificationId?: string): string {
        const id = notificationId ?? `notification-${globalId++}`
        const params = isParams(messageOrParams) ? messageOrParams : {
            message: messageOrParams,
        }

        if (this._notifications.has(id)) {
            const notification = this._notifications.get(id)!

            notification.params = {
                ...notification.params,
                ...params,
            }

            notification.ref?.current?.reset()
        }
        else {
            const item: Item = {
                id,
                params,
                opened: true,
                ref: createRef() as MutableRefObject<NotificationRef>,
                onClose: () => this.close(id),
                onClosed: () => this.remove(id),
            }

            this._notifications.set(id, item)
        }

        return id
    }

    public error(message: ReactNode, notificationId?: string): string {
        return this.show({
            type: 'error',
            message: (
                <>
                    {Icons.triangleAlert}
                    {message}
                </>
            ),
        }, notificationId)
    }

    public success(message: ReactNode, notificationId?: string): string {
        return this.show({
            type: 'success',
            message: (
                <>
                    {Icons.check}
                    {message}
                </>
            ),
        }, notificationId)
    }

    public close(id: string): void {
        const item = this._notifications.get(id)
        if (item) {
            item.opened = false
            item.params.onClose?.()
        }
    }

    private remove(id: string): void {
        this._notifications.delete(id)
    }

}

interface Item {
    id: string;
    opened: boolean;
    params: NotificationParams;
    ref?: MutableRefObject<NotificationRef>;
    onClose(): void;
    onClosed(): void;
}

export interface NotificationParams {
    type?: NotificationType;
    message: ReactNode;
    timeout?: number;
    action?: string;
    onAction?(): void;
    onClose?(): void;
}

function isParams(value: any): value is NotificationParams {
    return typeof value === 'object' && 'message' in value
}
