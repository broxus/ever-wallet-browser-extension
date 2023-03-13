import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStep, AccountabilityStore, Logger, RpcStore } from '@app/popup/modules/shared'
import { ChangeEvent } from 'react'

@injectable()
export class ManageSeedsViewModel {

    public backupInProgress = false

    public search = ''

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get masterKeys(): nt.KeyStoreEntry[] {
        const search = this.search.trim().toLowerCase()
        let keys = this.accountability.masterKeys

        if (search) {
            keys = keys.filter(
                ({ masterKey }) => (this.masterKeysNames[masterKey] || masterKey).toLowerCase().includes(search),
            )
        }

        return keys.sort((a, b) => {
            const nameA = this.masterKeysNames[a.masterKey] || a.masterKey
            const nameB = this.masterKeysNames[b.masterKey] || b.masterKey
            const byName = nameA.localeCompare(nameB)

            if (byName === 0) {
                return a.masterKey.localeCompare(b.masterKey)
            }

            return byName
        })
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get selectedMasterKey(): string | undefined {
        return this.accountability.selectedMasterKey
    }

    public get keysByMasterKey(): Record<string, nt.KeyStoreEntry[]> {
        return this.accountability.keysByMasterKey
    }

    public onManageMasterKey(seed: nt.KeyStoreEntry): void {
        this.accountability.onManageMasterKey(seed)
    }

    public addSeed(): void {
        this.accountability.reset()
        this.accountability.setStep(AccountabilityStep.CREATE_SEED)
    }

    public async onBackup(): Promise<void> {
        if (this.backupInProgress) return

        this.backupInProgress = true

        try {
            const storage = await this.rpcStore.rpc.exportStorage()

            this.downloadFileAsText(storage)
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this.backupInProgress = false
            })
        }
    }

    public async logOut(): Promise<void> {
        await this.accountability.logOut()
    }

    public handleSearch(e: ChangeEvent<HTMLInputElement>): void {
        this.search = e.target.value
    }

    private downloadFileAsText(text: string) {
        const a = window.document.createElement('a')
        a.href = window.URL.createObjectURL(new Blob([text], { type: 'application/json' }))
        a.download = 'ever-wallet-backup.json'

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

}
