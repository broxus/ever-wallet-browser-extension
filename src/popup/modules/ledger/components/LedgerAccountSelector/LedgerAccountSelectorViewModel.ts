import type { KeyStoreEntry } from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { LedgerAccount } from '@app/models'
import { AccountabilityStore, ConnectionStore, Logger, NotificationStore, RpcStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { getDefaultContractType } from '@app/shared'

@injectable()
export class LedgerAccountSelectorViewModel {

    public loading = false

    public saving = false

    public ledgerAccounts: LedgerAccount[] = []

    public currentPage = 0

    public selected = new Set<number>()

    public keysToRemove = new Set<string>()

    public onSuccess!: () => void

    public onError!: (e: any) => void

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private logger: Logger,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.getPage(0)
    }

    public get storedKeys(): Record<string, KeyStoreEntry | undefined> {
        return this.accountability.storedKeys
    }

    public get canSave(): boolean {
        return !!this.selected.size || !!this.keysToRemove.size
    }

    public setChecked(account: LedgerAccount, checked: boolean): void {
        const { publicKey, index } = account

        if (!checked) {
            this.selected.delete(index)
            this.keysToRemove.add(publicKey)
        }
        else {
            this.selected.add(index)
            this.keysToRemove.delete(publicKey)
        }
    }

    public async getPage(page: number): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            const accountSlice = await this.rpcStore.rpc.getLedgerPage(page)

            runInAction(() => {
                this.ledgerAccounts = accountSlice
                this.currentPage = page
            })
        }
        catch (e: any) {
            this.logger.error(e)
            this.showError(parseError(e))
            this.onError(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async saveAccounts(): Promise<void> {
        if (this.saving) return
        this.saving = true

        try {
            const accounts = Object.values(this.accountability.accountEntries)
            const keysToRemove = this.keysToRemove.values()
            const selected = this.selected.values()

            for (const publicKeyToRemove of keysToRemove) {
                const account = accounts.find(
                    (account) => account?.tonWallet.publicKey === publicKeyToRemove,
                )

                try {
                    await this.rpcStore.rpc.removeKey({ publicKey: publicKeyToRemove })

                    if (account) {
                        await this.rpcStore.rpc.removeAccount(account.tonWallet.address)
                    }
                }
                catch (e) {
                    this.logger.error(e)
                    throw e
                }
            }

            for (const accountId of selected) {
                let key: KeyStoreEntry | undefined

                try {
                    key = await this.rpcStore.rpc.createLedgerKey({ accountId })

                    const accounts = await this.accountability.addExistingWallets(key.publicKey)

                    if (!accounts.length) {
                        await this.rpcStore.rpc.createAccount({
                            name: `Ledger ${accountId + 1}`,
                            publicKey: key.publicKey,
                            contractType: getDefaultContractType(
                                this.connectionStore.selectedConnectionNetworkGroup,
                                this.connectionStore.connectionConfig,
                            ),
                            workchain: 0,
                        }, false)
                    }
                }
                catch (e: any) {
                    if (key) {
                        this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error)
                    }

                    throw e
                }
            }

            this.onSuccess()
        }
        catch (e: any) {
            this.logger.error(e)
            this.showError(parseError(e))
        }
        finally {
            runInAction(() => {
                this.saving = false
            })
        }
    }

    private showError(message: string): void {
        this.notification.error(message)
    }

}
