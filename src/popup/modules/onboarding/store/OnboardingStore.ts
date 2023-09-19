import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { parseError } from '@app/popup/utils'

import { NotificationStore, RpcStore } from '../../shared'

@singleton()
export class OnboardingStore {

    public loading = false

    public error: string | undefined

    constructor(
        public notification: NotificationStore,
        private rpcStore: RpcStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async restoreFromBackup(): Promise<void | Error> {
        if (this.loading) return
        this.loading = true
        this.error = undefined

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
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
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
