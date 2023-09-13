import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, LocalizationStore, NotificationStore, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class DeleteKeyViewModel {

    public keyEntry!: nt.KeyStoreEntry

    public onDeleted?: () => void

    public error = ''

    public loading = false

    constructor(
        public handle: SlidingPanelHandle,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get name(): string {
        return this.keyEntry.name || convertPublicKey(this.keyEntry.publicKey)
    }

    public get accounts(): nt.AssetsList[] {
        const { currentDerivedKeyAccounts, currentDerivedKeyExternalAccounts } = this.accountability

        return currentDerivedKeyAccounts
            .concat(currentDerivedKeyExternalAccounts)
            .sort((a, b) => a.name.localeCompare(b.name))
    }

    public get accountsByPublicKey(): Record<string, number> {
        return Object.values(this.accountability.accountEntries).reduce((result, account) => {
            if (!result[account.tonWallet.publicKey]) {
                result[account.tonWallet.publicKey] = 0
            }
            result[account.tonWallet.publicKey] += 1
            return result
        }, {} as Record<string, number>)
    }

    public async deleteKey(): Promise<void> {
        if (this.loading) return

        this.loading = true

        try {
            const { currentDerivedKeyAccounts, selectedAccountAddress } = this.accountability
            const { publicKey } = this.keyEntry
            const accountsToRemove = currentDerivedKeyAccounts.map(({ tonWallet: { address }}) => address)

            await this.rpcStore.rpc.removeAccounts(accountsToRemove)
            await this.rpcStore.rpc.removeKey({ publicKey })

            if (selectedAccountAddress && accountsToRemove.includes(selectedAccountAddress)) {
                await this.rpcStore.rpc.selectFirstAccount()
            }

            this.notification.show(
                this.localization.intl.formatMessage({ id: 'DELETE_KEY_SUCCESS_NOTIFICATION' }),
            )

            this.accountability.setCurrentDerivedKey(undefined)

            this.handle.close()
            this.onDeleted?.()
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

}
