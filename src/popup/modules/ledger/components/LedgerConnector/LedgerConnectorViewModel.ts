import { makeAutoObservable } from 'mobx'
import { Disposable, injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { AppConfig, LocalizationStore, Logger, NotificationStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class LedgerConnectorViewModel implements Disposable {

    public onNext!: () => void

    public onBack!: () => void

    public loading = false

    private rpcDisposer: (() => void) | undefined

    private tabsDisposer: (() => void) | undefined

    constructor(
        private rpcStore: RpcStore,
        private localizationStore: LocalizationStore,
        private notification: NotificationStore,
        private logger: Logger,
        private config: AppConfig,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    dispose(): void | Promise<void> {
        this.rpcDisposer?.()
        this.tabsDisposer?.()
    }

    public get isPopup(): boolean {
        return this.config.window.type === 'popup' || this.config.activeTab.type === 'popup'
    }

    public setLoading(loading: boolean): void {
        this.loading = loading
    }

    public async handleMessage(reply: any): Promise<boolean> {
        this.loading = true

        try {
            if (!reply.data?.success) {
                const message = this.getMessageError(reply.data?.error.message)
                this.logger.log('Ledger Bridge Error: ', reply.data?.error.message)

                if (message) {
                    this.showError(message)
                }

                return false
            }

            await this.rpcStore.rpc.getLedgerMasterKey()
            this.logger.log('Ledger Bridge Data: ', reply.data?.payload)

            return true
        }
        catch (e) {
            this.logger.log('Ledger Bridge Error: ', e)

            this.showError(
                this.localizationStore.intl.formatMessage({ id: 'ERROR_LEDGER_GENERIC_ERROR' }),
            )
        }
        finally {
            this.setLoading(false)
        }

        return false
    }

    public async openLedgerTab(): Promise<void> {
        const { id } = await browser.windows.getCurrent()
        const tab = await this.rpcStore.rpc.openExtensionInBrowser({
            route: 'ledger',
            force: true,
            query: id ? `opener=${id}` : undefined,
        })

        this.rpcDisposer = this.rpcStore.addEventListener((event) => {
            if (event.type === 'ledger') {
                this.tabsDisposer?.()
                if (event.data.result === 'connected') {
                    this.onNext()
                }
                else {
                    this.onBack()
                }
            }
        })

        const handleTabClose = (tabId: number) => {
            if (tabId === tab.id) {
                this.onBack()
            }
        }

        browser.tabs.onRemoved.addListener(handleTabClose)
        this.tabsDisposer = () => browser.tabs.onRemoved.removeListener(handleTabClose)
    }

    private showError(message: string): void {
        this.notification.error(message)
    }

    private getMessageError(message: string): string | null {
        switch (message) {
            case LedgerErrorCode.LEDGER_WRONG_APP:
                return this.localizationStore.intl.formatMessage({ id: 'ERROR_LEDGER_WRONG_APP' })
            case LedgerErrorCode.LEDGER_LOCKED:
                return this.localizationStore.intl.formatMessage({ id: 'ERROR_LEDGER_LOCKED' })
            case LedgerErrorCode.USER_DENIED:
            case LedgerErrorCode.USER_CANCELLED:
                // skip user denied/cancelled errors as they are not actual errors and don't require notification
                return null
            default:
                return message
        }
    }

}

enum LedgerErrorCode {
    LEDGER_WRONG_APP = 'LEDGER_WRONG_APP',
    LEDGER_LOCKED = 'LEDGER_LOCKED',
    TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
    SIGN_NON_SUPPORTED = 'SIGN_NON_SUPPORTED',
    USER_DENIED = 'USER_DENIED',
    USER_CANCELLED = 'USER_CANCELLED',
}
