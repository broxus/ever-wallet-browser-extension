import { computed, makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'

import { ConnectionData, ConnectionDataItem, NetworkConfig, UpdateCustomNetwork } from '@app/models'
import { accountExplorerLink, NATIVE_CURRENCY, transactionExplorerLink } from '@app/shared'

import { RpcStore } from './RpcStore'

@singleton()
export class ConnectionStore {

    constructor(private rpcStore: RpcStore) {
        makeAutoObservable<ConnectionStore, any>(this, {
            networks: computed.struct,
            selectedConnection: computed.struct,
        }, { autoBind: true })
    }

    public get networks(): Record<number, ConnectionData> {
        return this.rpcStore.state.networks
    }

    public get connectionItems(): ConnectionDataItem[] {
        return Object.entries(this.networks).map(([key, value]) => ({
            ...value,
            connectionId: parseInt(key, 10),
        }))
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get pendingConnection(): ConnectionDataItem | undefined {
        return this.rpcStore.state.pendingConnection
    }

    public get failedConnection(): ConnectionDataItem | undefined {
        return this.rpcStore.state.failedConnection
    }

    public get selectedConnectionConfig(): NetworkConfig {
        return this.selectedConnection.config
    }

    public get symbol(): string {
        return this.selectedConnectionConfig.symbol ?? NATIVE_CURRENCY
    }

    public transactionExplorerLink(hash: string): string {
        const { explorerBaseUrl } = this.selectedConnectionConfig

        return transactionExplorerLink(explorerBaseUrl, hash)
    }

    public accountExplorerLink(address: string): string {
        const { explorerBaseUrl } = this.selectedConnectionConfig

        return accountExplorerLink(explorerBaseUrl, address)
    }

    public updateCustomNetwork(value: UpdateCustomNetwork): Promise<ConnectionDataItem> {
        return this.rpcStore.rpc.updateCustomNetwork(value)
    }

    public changeNetwork(network?: ConnectionDataItem): Promise<void> {
        return this.rpcStore.rpc.changeNetwork(network)
    }

    public deleteCustomNetwork(connectionId: number): Promise<void> {
        return this.rpcStore.rpc.deleteCustomNetwork(connectionId)
    }

}
