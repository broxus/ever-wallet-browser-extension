import type * as nt from '@broxus/ever-wallet-wasm'
import { action, makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'

@injectable()
export class LedgerVerifyAddressViewModel {

    public address!: string

    public ledgerLoading = false

    public ledgerConnected = true

    public progress = false

    public confirmed = false

    constructor(
        private handle: SlidingPanelHandle,
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
            await this.rpcStore.rpc.openExtensionInBrowser({
                route: 'ledger',
                force: true,
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
            this.handle.close()
        }
    }

    public handleClose(): void {
        this.handle.close()
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
