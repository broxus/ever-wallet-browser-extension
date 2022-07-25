import type { KeyStoreEntry } from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { LedgerAccount } from '@app/models'
import { AccountabilityStore, LocalizationStore, RpcStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { Logger } from '@app/shared'

@injectable()
export class LedgerAccountSelectorViewModel {

    public loading = false

    public error: string | undefined

    public ledgerAccounts: LedgerAccount[] = []

    public currentPage = 1

    public selected = new Set<number>()

    public keysToRemove = new Set<string>()

    public onSuccess!: () => void

    public onError!: (e: any) => void

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localizationStore: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable<LedgerAccountSelectorViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            localizationStore: false,
            logger: false,
        }, { autoBind: true })
    }

    public get storedKeys(): Record<string, KeyStoreEntry> {
        return this.accountability.storedKeys
    }

    public resetError(): void {
        this.error = undefined
    }

    public setLoading(loading: boolean): void {
        this.loading = loading
    }

    public setError(error: string): void {
        this.error = error
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

    public async getNewPage(page: LedgerPage): Promise<void> {
        let accountSlice: Array<LedgerAccount> = []

        this.loading = true
        this.error = undefined

        try {
            switch (page) {
                case LedgerPage.First:
                    accountSlice = await this.rpcStore.rpc.getLedgerFirstPage()
                    break

                case LedgerPage.Next:
                    accountSlice = await this.rpcStore.rpc.getLedgerNextPage()
                    break

                case LedgerPage.Previous:
                    accountSlice = await this.rpcStore.rpc.getLedgerPreviousPage()
                    break

                default:
                    this.logger.error(`[LedgerAccountSelectorViewModel] unknown page value: ${page}`)
                    break
            }

            runInAction(() => {
                this.ledgerAccounts = accountSlice
                this.currentPage = (accountSlice[0]?.index ?? 0) / 5 + 1
            })
        }
        catch (e: any) {
            this.logger.error(e)
            this.setError(parseError(e))
            this.onError(e)
        }
        finally {
            this.setLoading(false)
        }
    }

    public async saveAccounts(): Promise<void> {
        this.loading = true
        this.error = undefined

        for (const publicKeyToRemove of this.keysToRemove.values()) {
            const account = Object.values(this.accountability.accountEntries).find(
                account => account.tonWallet.publicKey === publicKeyToRemove,
            )

            try {
                await this.rpcStore.rpc.removeKey({ publicKey: publicKeyToRemove })

                if (account) {
                    await this.rpcStore.rpc.removeAccount(account.tonWallet.address)
                }
            }
            catch (e) {
                this.logger.error(e)
                this.setError(parseError(e))
            }
        }

        for (const accountId of this.selected.values()) {
            let key: KeyStoreEntry | undefined

            try {
                key = await this.rpcStore.rpc.createLedgerKey({
                    accountId,
                })

                await this.rpcStore.rpc.createAccount({
                    name: `Ledger ${accountId + 1}`,
                    publicKey: key.publicKey,
                    contractType: 'SafeMultisigWallet',
                    workchain: 0,
                })
            }
            catch (e: any) {
                if (key) {
                    this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error)
                }

                this.logger.error(e)
                this.setError(parseError(e))
            }
        }

        this.setLoading(false)

        if (!this.error) {
            this.onSuccess()
        }
    }

}

export enum LedgerPage {
    First,
    Next,
    Previous,
}
