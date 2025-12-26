import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem } from '@app/models'
import { AccountabilityStore, ConnectionStore, RpcStore } from '@app/popup/modules/shared'
import { parseAddress, type ConnectionConfig } from '@app/shared'

@injectable()
export class NetworksViewModel {

    public loading = false

    constructor(
        private connectionStore: ConnectionStore,
        private accountability: AccountabilityStore,
        private rpcStore: RpcStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get networks(): ConnectionDataItem[] {
        return this.connectionStore.connectionItems
    }

    public get config(): ConnectionConfig {
        return this.connectionStore.connectionConfig
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.connectionStore.selectedConnection
    }

    public get pendingConnection(): ConnectionDataItem | undefined {
        return this.connectionStore.pendingConnection
    }

    public get networkTitle(): string {
        if (!this.pendingConnection || this.pendingConnection.id === this.selectedConnection.id) {
            return this.selectedConnection.name
        }

        return `${this.pendingConnection.name}...`
    }

    public async changeNetwork(network: ConnectionDataItem): Promise<void> {
        if (this.selectedConnection.id === network.id) return
        const selectedWorkchainId = this.connectionStore.workchainId

        this.loading = true

        try {
            await this.accountability.importWorkchainAccounts(network.workchainId)

            await this.connectionStore.changeNetwork(network)

            if (selectedWorkchainId !== network.workchainId && this.accountability.selectedAccountAddress) {
                const [, address] = parseAddress(this.accountability.selectedAccountAddress)
                await this.accountability.selectAccount(`${network.workchainId}:${address}`)
            }
        }
        // TODO: catch
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
