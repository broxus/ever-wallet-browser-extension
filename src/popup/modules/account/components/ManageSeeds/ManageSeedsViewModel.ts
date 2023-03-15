import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStep, AccountabilityStore, Logger, RpcStore } from '@app/popup/modules/shared'
import { convertAddress } from '@app/shared'

@injectable()
export class ManageSeedsViewModel {

    public backupInProgress = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, {
            filter: false,
        }, { autoBind: true })
    }

    public get masterKeys(): nt.KeyStoreEntry[] {
        return this.accountability.masterKeys
            .map((key) => ({
                ...key,
                name: this.masterKeysNames[key.masterKey] || convertAddress(key.masterKey),
            }))
            .sort((a, b) => {
                const byName = a.name.localeCompare(b.name)
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

    public async selectMasterKey(key: nt.KeyStoreEntry): Promise<void> {
        const accounts = this.accountability.getAccountsByMasterKey(key.masterKey)
        const account = accounts.find(
            ({ tonWallet }) => this.accountability.accountsVisibility[tonWallet.address],
        ) ?? accounts.at(0)

        if (!account) {
            this.accountability.setCurrentMasterKey(key)
            this.accountability.setStep(AccountabilityStep.MANAGE_SEED)
        }
        else {
            await this.rpcStore.rpc.selectMasterKey(key.masterKey)
            await this.rpcStore.rpc.selectAccount(account.tonWallet.address)
        }
    }

    public filter(list: nt.KeyStoreEntry[], search: string): nt.KeyStoreEntry[] {
        return list.filter(
            ({ name }) => name.toLowerCase().includes(search),
        )
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
