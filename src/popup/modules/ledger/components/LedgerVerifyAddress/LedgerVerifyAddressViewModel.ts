import type nt from '@wallet/nekoton-wasm'
import { action, makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class LedgerVerifyAddressViewModel {

    public address!: string

    public onBack!: () => void

    public ledgerLoading = false

    public ledgerConnected = true

    public progress = false

    public confirmed = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.checkLedger()
            .then(this.validate)
            .catch(action(() => {
                this.ledgerConnected = false
            }))
    }

    public get account(): nt.AssetsList {
        return this.accountability.accountEntries[this.address]
    }

    public async validate(): Promise<void> {
        this.ledgerConnected = true
        this.progress = true

        try {
            await this.rpcStore.rpc.getLedgerMasterKey()
        }
        catch {
            await this.rpcStore.rpc.openExtensionInExternalWindow({
                group: 'ask_iframe',
                width: 360 + getScrollWidth() - 1,
                height: 600 + getScrollWidth() - 1,
            })
            await closeCurrentWindow()
            return
        }

        try {
            await this.rpcStore.rpc.getLedgerAddress(this.account)
            runInAction(() => {
                this.progress = false
                this.confirmed = true
            })
        }
        catch {
            this.onBack()
        }
    }

    private async checkLedger(): Promise<void> {
        try {
            this.ledgerLoading = true
            await this.rpcStore.rpc.getLedgerMasterKey()
        }
        finally {
            runInAction(() => {
                this.ledgerLoading = false
            })
        }
    }

}
