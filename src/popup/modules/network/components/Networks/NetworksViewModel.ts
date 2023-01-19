import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem } from '@app/models'
import { ConnectionStore } from '@app/popup/modules/shared'

@injectable()
export class NetworksViewModel {

    public loading = false

    public dropdownActive = false

    constructor(
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get networks(): ConnectionDataItem[] {
        return this.connectionStore.connectionItems
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.connectionStore.selectedConnection
    }

    public get pendingConnection(): ConnectionDataItem | undefined {
        return this.connectionStore.pendingConnection
    }

    public get networkTitle(): string {
        if (!this.pendingConnection || this.pendingConnection.connectionId === this.selectedConnection.connectionId) {
            return this.selectedConnection.name
        }

        return `${this.pendingConnection.name}...`
    }

    public toggleDropdown(): void {
        this.dropdownActive = !this.dropdownActive
    }

    public hideDropdown(): void {
        this.dropdownActive = false
    }

    public async changeNetwork(network: ConnectionDataItem): Promise<void> {
        if (this.selectedConnection.connectionId === network.connectionId) return

        this.hideDropdown()
        this.loading = true

        try {
            await this.connectionStore.changeNetwork(network)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
