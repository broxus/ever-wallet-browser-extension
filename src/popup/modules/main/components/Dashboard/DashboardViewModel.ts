import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, Drawer, Panel, SlidingPanelStore } from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'

@injectable()
export class DashboardViewModel {

    public addressToVerify: string | undefined

    constructor(
        public drawer: Drawer,
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get pendingConnection(): ConnectionDataItem | undefined {
        return this.connectionStore.pendingConnection
    }

    public get failedConnection(): ConnectionDataItem | undefined {
        return this.connectionStore.failedConnection
    }

    public get showConnectionError(): boolean {
        return !!this.failedConnection && !this.pendingConnection
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public verifyAddress(address: string): void {
        this.addressToVerify = address
        this.drawer.setPanel(Panel.VERIFY_ADDRESS)
    }

    public reset(): void {
        this.accountability.reset()
    }

    public closePanel(): void {
        this.reset()
        this.drawer.close()
    }

}
