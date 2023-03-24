import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import {
    AccountabilityStep,
    AccountabilityStore,
    LocalizationStore,
    NotificationStore,
    RpcStore,
} from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class DeleteSeedViewModel {

    public keyEntry!: nt.KeyStoreEntry

    public onClose!: () => void

    public error = ''

    public loading = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get name(): string {
        return this.accountability.masterKeysNames[this.keyEntry.masterKey] ?? convertPublicKey(this.keyEntry.masterKey)
    }

    public get derivedKeys(): nt.KeyStoreEntry[] {
        return this.storedKeys
            .filter(({ masterKey }) => masterKey === this.keyEntry.masterKey)
            .sort((a, b) => a.accountId - b.accountId)
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

    public get isLast(): boolean {
        return this.accountability.masterKeys.length === 1
    }

    private get storedKeys(): nt.KeyStoreEntry[] {
        return Object.values(this.accountability.storedKeys)
    }

    public async deleteSeed(): Promise<void> {
        if (this.loading) return

        this.loading = true

        try {
            await this.rpcStore.rpc.removeMasterKey(this.keyEntry.masterKey)
            await this.rpcStore.rpc.selectFirstAccount()
            this.notification.show(
                this.localization.intl.formatMessage({ id: 'DELETE_SEED_SUCCESS_NOTIFICATION' }),
            )

            this.accountability.reset()
            this.accountability.setStep(AccountabilityStep.MANAGE_SEEDS)

            this.onClose()
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

    public async logOut(): Promise<void> {
        await this.accountability.logOut()
    }

}
