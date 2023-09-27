import { singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'
import { ReactNode } from 'react'

let globalId = 0

@singleton()
export class SlidingPanelStore {

    private _panels = new Map<string, Item>()

    constructor() {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get panels(): Item[] {
        return [...this._panels.values()]
    }

    public open(params: SlidingPanelParams): SlidingPanelHandle {
        const id = `notification-${globalId++}`
        const handle = new SlidingPanelHandle(id, this)
        const item: Item = {
            id,
            params,
            handle,
            active: true,
            onClose: () => this.close(id),
            onClosed: () => this.remove(id),
        }

        this._panels.set(id, item)

        return handle
    }

    public update(id: string, params: Partial<SlidingPanelParams>): void {
        const item = this._panels.get(id)
        if (item) {
            item.params = {
                ...item.params,
                ...params,
            }
        }
    }

    public close(id: string): void {
        const item = this._panels.get(id)
        if (item) {
            item.active = false
            item.params.onClose?.()
        }
    }

    private remove(id: string): void {
        this._panels.delete(id)
    }

}

export class SlidingPanelHandle {

    constructor(
        readonly id: string,
        private store: SlidingPanelStore,
    ) {
    }

    public update(params: Partial<SlidingPanelParams>): void {
        this.store.update(this.id, params)
    }

    public close(): void {
        this.store.close(this.id)
    }

}

interface Item {
    readonly id: string;
    readonly handle: SlidingPanelHandle;
    active: boolean;
    params: SlidingPanelParams;
    onClose(): void;
    onClosed(): void;
}

export interface SlidingPanelParams {
    render: () => ReactNode | null;
    className?: string;
    showClose?: boolean;
    closeOnBackdropClick?: boolean;
    fullHeight?: boolean;
    whiteBg?: boolean;
    onClose?(): void;
    onClosed?(): void;
}
