import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { RpcStore } from '@app/popup/modules/shared'
import { closeCurrenTab, focusWindow } from '@app/shared'
import { LedgerRpcEvent } from '@app/popup/modules/ledger/models'
import browser from 'webextension-polyfill'

@injectable()
export class LedgerConnectorPageViewModel {

    constructor(private rpcStore: RpcStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async handleClose(): Promise<void> {
        const event: LedgerRpcEvent = {
            type: 'ledger',
            data: { result: 'failed' },
        }

        await this.rpcStore.rpc.sendEvent(event)
        await this.returnFocus()
        await closeCurrenTab()
    }

    public async handleConnect(): Promise<void> {
        const event: LedgerRpcEvent = {
            type: 'ledger',
            data: { result: 'connected' },
        }

        await this.rpcStore.rpc.sendEvent(event)
        await this.returnFocus()
        await closeCurrenTab()
    }

    private async returnFocus(): Promise<void> {
        try {
            const params = new URLSearchParams(location.search)
            const opener = params.get('opener')

            if (opener) {
                const windowId = parseInt(opener, 10)

                if (!Number.isNaN(windowId)) {
                    await focusWindow(windowId)
                }
            }
        }
        catch {}
    }

}
