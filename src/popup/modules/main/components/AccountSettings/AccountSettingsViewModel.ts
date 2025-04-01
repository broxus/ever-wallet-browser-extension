import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { AccountabilityStore, ConnectionStore, LocalizationStore, NotificationStore, RpcStore, SlidingPanelHandle, SlidingPanelStore } from '@app/popup/modules/shared'
import { supportedByLedger } from '@app/shared'

@injectable()
export class AccountSettingsViewModel {

    public address!: string

    public loading = false

    constructor(
        public handle: SlidingPanelHandle,
        public panel: SlidingPanelStore,
        private rpcStore: RpcStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList | undefined {
        return this.accountability.accountEntries[this.address]
    }

    public get key(): nt.KeyStoreEntry | undefined {
        return this.account ? this.accountability.storedKeys[this.account.tonWallet.publicKey] : undefined
    }

    public get canVerify(): boolean {
        return this.key?.signerName === 'ledger_key' && supportedByLedger(this.account?.tonWallet.contractType)
    }

    public get custodians(): string[] {
        return this.accountability.accountCustodians[this.address] ?? []
    }

    public async openAccountInExplorer(): Promise<void> {
        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(this.address),
            active: false,
        })
    }

    public async hideAccount(address: string): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            await this.rpcStore.rpc.updateAccountVisibility(address, false)
            this.showHideNotification(address)
        }
        catch (e) {
            console.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private showHideNotification(address: string): void {
        this.notification.show({
            message: this.localization.intl.formatMessage({ id: 'HIDE_ACCOUNT_SUCCESS_NOTIFICATION' }),
            action: this.localization.intl.formatMessage({ id: 'UNDO_BTN_TEXT' }),
            onAction: () => this.rpcStore.rpc.updateAccountVisibility(address, true),
        })
    }


}
