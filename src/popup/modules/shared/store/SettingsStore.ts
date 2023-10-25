import { Disposable, singleton } from 'tsyringe'
import { makeAutoObservable } from 'mobx'

import { Logger } from '../utils'

@singleton()
export class SettingsStore implements Disposable {

    private _data: Settings = {}

    constructor(private logger: Logger) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this._data = this.read()

        window.addEventListener('storage', this.onStorageEvent)
    }

    public dispose(): void {
        window.removeEventListener('storage', this.onStorageEvent)
    }

    public get data(): Settings {
        return this._data
    }

    public update(value: Partial<Settings>): void {
        this._data = {
            ...this._data,
            ...value,
        }

        this.write(this._data)
    }

    private write(data: Settings): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }
        catch (e) {
            this.logger.error(e)
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    private read(): Settings {
        const value = localStorage.getItem(STORAGE_KEY) ?? '{}'

        try {
            return JSON.parse(value)
        }
        catch (e) {
            this.logger.error(e)
            return {}
        }
    }

    private onStorageEvent(e: StorageEvent): void {
        if (e.key !== STORAGE_KEY) return
        this._data = this.read()
    }

}

const STORAGE_KEY = 'wallet:password-settings'

interface SettingsEntry {
    cache: boolean; // cache password
}

type Settings = Record<string, SettingsEntry | undefined>
