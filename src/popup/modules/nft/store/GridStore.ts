import { singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'

@singleton()
export class GridStore {

    private _layout: GridLayout = 'tile'

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })

        const value = localStorage.getItem(STORAGE_KEY)

        if (isGridLayout(value)) {
            this._layout = value
        }
    }

    public get layout(): GridLayout {
        return this._layout
    }

    public setLayout(value: GridLayout): void {
        this._layout = value
        localStorage.setItem(STORAGE_KEY, value)
    }

}

const STORAGE_KEY = 'wallet:grid-layout'

export type GridLayout = 'tile' | 'row'

function isGridLayout(value: any): value is GridLayout {
    return value === 'tile' || value === 'row'
}
