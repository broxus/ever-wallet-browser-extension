import { singleton } from 'tsyringe'
import { ReactNode } from 'react'
import { makeAutoObservable } from 'mobx'

import type { NotificationType } from '../components'

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

    public show(message: ReactNode): string
    public show(params: NotificationParams): string
    public show(messageOrParams: NotificationParams | ReactNode): string {
        const id = `notification-${globalId++}`
        const item: Item = {
            id,
            params: isParams(messageOrParams) ? messageOrParams : {
                message: messageOrParams,
            },
            opened: true,
            onClose: () => this.close(id),
            onClosed: () => this.remove(id),
        }

        this._notifications.set(id, item)

        return id
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
