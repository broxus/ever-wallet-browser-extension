import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem } from '@app/models'
import { RpcStore } from '@app/popup/modules/shared'

@injectable()
export class NetworkSettingsViewModel {

    public loading = false

    public dropdownActive = false

    public networks: ConnectionDataItem[] = []

    constructor(
        private rpcStore: RpcStore,
    ) {
        makeAutoObservable<NetworkSettingsViewModel, any>(this, {
            rpcStore: false,
        }, { autoBind: true })
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get pendingConnection(): ConnectionDataItem | undefined {
        return this.rpcStore.state.pendingConnection
    }

    public get networkTitle(): string {
        if (!this.pendingConnection || this.pendingConnection.id === this.selectedConnection.id) {
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

    public async getAvailableNetworks(): Promise<void> {
        const networks = await this.rpcStore.rpc.getAvailableNetworks()

        this.setNetworks(networks)
    }

    public async changeNetwork(network: ConnectionDataItem): Promise<void> {
        if (this.selectedConnection.id === network.id) return

        this.hideDropdown()
        this.loading = true

        try {
            await this.rpcStore.rpc.changeNetwork(network)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private setNetworks(networks: ConnectionDataItem[]) {
        this.networks = networks
    }

}
