import { injectable } from 'tsyringe'
import { makeAutoObservable, runInAction } from 'mobx'
import type { KeyStoreEntry } from '@broxus/ever-wallet-wasm'

import { AccountabilityStore, ConnectionStore, Logger, NotificationStore, RpcStore } from '@app/popup/modules/shared'
import { LedgerAccount } from '@app/models'
import { parseError } from '@app/popup/utils'
import { getDefaultContractType } from '@app/shared'

@injectable()
export class LedgerSignInViewModel {

    public loading = false

    public saving = false

    public ledgerAccounts: LedgerAccount[] = []

    public currentPage = 0

    public selected = new Set<number>()

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

    public get canSave(): boolean {
        return !!this.selected.size
    }

    public get accountSlice(): LedgerAccount[] {
        const from = this.currentPage * ITEMS_PER_PAGE
        return this.ledgerAccounts.slice(from, from + ITEMS_PER_PAGE)
    }

    public setChecked(account: LedgerAccount, checked: boolean): void {
        const { index } = account

        if (!checked) {
            this.selected.delete(index)
        }
        else {
            this.selected.add(index)
        }
    }

    public async getPage(page: number): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            // ledger page size is 5, need 12 elements by design
            const from = page * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE
            const fromPage = Math.floor(from / LEDGER_PER_PAGE)
            const toPage = Math.floor(to / LEDGER_PER_PAGE)

            if (!this.hasAll(from, to)) {
                await this.getPages(fromPage, toPage)
            }

            runInAction(() => {
                this.currentPage = page
            })
        }
        catch (e: any) {
            this.logger.error(e)
            this.showError(parseError(e))
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
            const selected = this.selected.values()
            let masterKey: string | undefined

            for (const accountId of selected) {
                let key: KeyStoreEntry | undefined

                try {
                    key = await this.rpcStore.rpc.createLedgerKey({ accountId })
                    masterKey ??= key.masterKey

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
                        }, true)
                    }
                }
                catch (e: any) {
                    if (key) {
                        this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error)
                    }

                    throw e
                }
            }

            await this.rpcStore.rpc.selectMasterKey(masterKey!)
            await this.rpcStore.rpc.ensureAccountSelected()
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

    private async getPages(fromPage: number, toPage: number): Promise<void> {
        const accounts: LedgerAccount[] = []
        for (let i = fromPage; i <= toPage; i++) {
            accounts.push(
                ...(await this.rpcStore.rpc.getLedgerPage(i)),
            )
        }

        runInAction(() => {
            for (const account of accounts) {
                this.ledgerAccounts[account.index] = account
            }
        })
    }

    private hasAll(from: number, to: number): boolean {
        for (let i = from; i < to; i++) {
            if (!this.ledgerAccounts[i]) return false
        }

        return true
    }

}

const ITEMS_PER_PAGE = 12
const LEDGER_PER_PAGE = 5
