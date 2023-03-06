import { makeAutoObservable } from 'mobx'
import { Disposable, injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { AppConfig, LocalizationStore, Logger, RpcStore } from '@app/popup/modules/shared'

import { isLedgerRpcEvent } from '../../models'

@injectable()
export class LedgerConnectorViewModel implements Disposable {

    public onNext!: () => void

    public onBack!: () => void

    public loading = false

    public error: string | undefined

    private rpcDisposer: (() => void) | undefined

    private tabsDisposer: (() => void) | undefined

    constructor(
        private rpcStore: RpcStore,
        private localizationStore: LocalizationStore,
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

    public resetError(): void {
        this.error = undefined
    }

    public setLoading(loading: boolean): void {
        this.loading = loading
    }

    public setError(error: string): void {
        this.error = error
    }

    public async handleMessage(reply: any): Promise<boolean> {
        this.error = undefined
        this.loading = true

        try {
            if (!reply.data?.success) {
                this.error = reply.data?.error.message
                this.logger.log('Ledger Bridge Error: ', this.error)
            }
            else {
                await this.rpcStore.rpc.getLedgerMasterKey()
                this.logger.log('Ledger Bridge Data: ', reply.data?.payload)

                return true
            }
        }
        catch (e) {
            this.logger.log('Ledger Bridge Error: ', e)

            this.setError(
                this.localizationStore.intl.formatMessage({ id: 'ERROR_FAILED_TO_CONNECT_TO_LEDGER' }),
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
            if (isLedgerRpcEvent(event)) {
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

}
