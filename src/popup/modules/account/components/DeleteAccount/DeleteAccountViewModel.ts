import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, LocalizationStore, NotificationStore, Router, RpcStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class DeleteAccountViewModel {

    public error = ''

    public loading = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList | undefined {
        return this.accountability.currentAccount
    }

    public async deleteAccount(): Promise<void> {
        if (this.loading || !this.account) return

        this.loading = true

        try {
            const account = this.account


            await this.rpcStore.rpc.removeAccount(account.tonWallet.address)
            await this.rpcStore.rpc.selectFirstAccount()

            this.notification.show({
                message: this.localization.intl.formatMessage({ id: 'REMOVE_ACCOUNT_SUCCESS_NOTIFICATION' }),
                action: this.localization.intl.formatMessage({ id: 'UNDO_BTN_TEXT' }),
                onAction: async () => {
                    await this.rpcStore.rpc.createAccount({
                        name: account.name,
                        contractType: account.tonWallet.contractType,
                        publicKey: account.tonWallet.publicKey,
                        explicitAddress: account.tonWallet.address,
                        workchain: this.connectionStore.workchainId,
                    }, false)
                },
            })

            this.onAccountDeleted()
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

    public onAccountDeleted(): void {
        this.accountability.setCurrentAccountAddress(undefined)
        this.router.navigate('../../key')
    }

}
