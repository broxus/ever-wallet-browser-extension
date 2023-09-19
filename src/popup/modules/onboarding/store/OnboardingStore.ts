import { AbstractStore } from '@broxus/js-core'
import { action, computed, makeObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { parseError } from '@app/popup/utils'

import { AccountabilityStore, LocalizationStore, RpcStore } from '../../shared'


type OnboardingStoreeData = {
}

type OnboardingStoreState = {
    restoreInProcess: boolean
    restoreError: any
}

@singleton()
export class OnboardingStore extends AbstractStore<
    OnboardingStoreeData,
    OnboardingStoreState
> {

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
    ) {
        super()
        makeObservable(this)
    }

    @action.bound
    public setLocale(locale: string): Promise<void> {
        return this.localization.setLocale(locale)
    }

    @computed
    public get selectedLocale(): string {
        return this.rpcStore.state.selectedLocale
    }

    @computed
    public get selectedMasterKey(): string | undefined {
        return this.accountability.selectedMasterKey
    }

    @computed
    public get _restoreError(): string | undefined {
        return this._state.restoreError
    }

    @computed
    public get _restoreInProcess(): boolean | undefined {
        return this._state.restoreInProcess
    }

    @action.bound
    public async restoreFromBackup(): Promise<void | Error> {
        if (this._restoreInProcess) return

        this.setState('restoreInProcess', true)
        this.setState('restoreError', null)

        try {
            const file = await this.updateFile()
            const storage = file ? await this.readFile(file) : null
            const result = storage ? await this.rpcStore.rpc.importStorage(storage) : false

            if (!file || !storage) {
                // eslint-disable-next-line consistent-return
                return new Error('Failed to import storage')
            }

            if (!result) {
                throw new Error('Failed to import storage')
            }

            await this.rpcStore.rpc.ensureAccountSelected()

            // redirect to finish page
        }
        catch (e) {
            runInAction(() => {
                this.setState('restoreError', parseError(e))
            })
        }
        finally {
            runInAction(() => {
                this.setState('restoreInProcess', false)
            })
        }
    }

    private updateFile(): Promise<File | undefined> {
        let lock = false
        return new Promise<File | undefined>(resolve => {
            // create input file
            const input = document.createElement('input')
            input.id = (+new Date()).toString()
            input.style.display = 'none'
            input.setAttribute('type', 'file')
            input.accept = '.json'
            document.body.appendChild(input)

            input.addEventListener(
                'change',
                () => {
                    lock = true
                    const file = input.files?.[0]
                    resolve(file)
                    // remove dom
                    const fileInput = document.getElementById(input.id)
                    fileInput?.remove()
                },
                { once: true },
            )

            // file blur
            window.addEventListener(
                'focus',
                () => {
                    setTimeout(() => {
                        if (!lock && document.getElementById(input.id)) {
                            resolve(undefined)
                            // remove dom
                            const fileInput = document.getElementById(input.id)
                            fileInput?.remove()
                        }
                    }, 300)
                },
                { once: true },
            )

            // open file select box
            input.click()
        })
    }

    private readFile(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = event => {
                resolve(event.target?.result as string)
            }
            reader.onerror = _error => {
                reject(reader.error)
            }
            reader.readAsText(file)
        })
    }

}
