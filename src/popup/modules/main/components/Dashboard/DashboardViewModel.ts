import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionStore, SlidingPanelStore } from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'

@injectable()
export class DashboardViewModel {

    constructor(
        public panel: SlidingPanelStore,
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

}
