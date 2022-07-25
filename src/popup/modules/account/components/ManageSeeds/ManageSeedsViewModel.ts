import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { Logger } from '@app/shared'
import { AccountabilityStep, AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class ManageSeedsViewModel {

    public backupInProgress = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable<ManageSeedsViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            logger: false,
        }, { autoBind: true })
    }

    public get masterKeys(): nt.KeyStoreEntry[] {
        return this.accountability.masterKeys
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get selectedMasterKey(): string | undefined {
        return this.accountability.selectedMasterKey
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

    private downloadFileAsText(text: string) {
        const a = window.document.createElement('a')
        a.href = window.URL.createObjectURL(new Blob([text], { type: 'application/json' }))
        a.download = 'ever-wallet-backup.json'

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

}
