import type { KeyStoreEntry } from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { LedgerAccount } from '@app/models'
import { AccountabilityStore, LocalizationStore, RpcStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { Logger } from '@app/shared'

@injectable()
export class LedgerAccountSelectorViewModel {

    loading = false

    error: string | undefined

    ledgerAccounts: LedgerAccount[] = []

    currentPage = 1

    selected = new Set<number>()

    keysToRemove = new Set<string>()

    onSuccess!: () => void

    onError!: (e: any) => void

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
        })
    }

    get storedKeys(): Record<string, KeyStoreEntry> {
        return this.accountability.storedKeys
    }

    resetError = () => {
        this.error = undefined
    }

    setLoading = (loading: boolean) => {
        this.loading = loading
    }

    setError = (error: string) => {
        this.error = error
    }

    setChecked = (account: LedgerAccount, checked: boolean) => {
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

    getNewPage = async (page: LedgerPage) => {
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

    saveAccounts = async () => {
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
