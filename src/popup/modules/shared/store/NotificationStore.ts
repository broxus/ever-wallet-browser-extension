import { singleton } from 'tsyringe'
import { ReactNode } from 'react'
import { autorun, makeAutoObservable } from 'mobx'

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
    public show(params: Params): string
    public show(messageOrParams: Params | ReactNode): string {
        const id = `notification-${globalId++}`
        const item: Item = {
            id,
            params: isParams(messageOrParams) ? messageOrParams : {
                type: 'notification',
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
    params: Params;
    onClose(): void;
    onClosed(): void;
}

type Params = NotificationParams | UndoParams

export interface NotificationParams {
    type: 'notification';
    message?: ReactNode;
    className?: string;
    timeout?: number;
    title?: ReactNode;
    position?: 'top' | 'bottom';
    showClose?: boolean;
    onClose?(): void;
}

export interface UndoParams {
    type: 'undo';
    message?: ReactNode;
    position?: 'top' | 'bottom';
    onUndo(): void;
    onClose?(): void;
}

function isParams(value: any): value is Params {
    return value.type === 'notification' || value.type === 'undo'
}
