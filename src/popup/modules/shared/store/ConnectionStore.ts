import { computed, makeAutoObservable } from 'mobx'
import { inject, singleton } from 'tsyringe'

import { ConnectionData, ConnectionDataItem, type Nekoton, UpdateCustomNetwork } from '@app/models'
import { ConnectionConfig, NATIVE_CURRENCY_FALLBACK, NetworkGroup, NetworkType } from '@app/shared'
import { NekotonToken } from '@app/popup/modules/shared/di-container'

import { RpcStore } from './RpcStore'

@singleton()
export class ConnectionStore {

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private config: ConnectionConfig,
    ) {
        makeAutoObservable<ConnectionStore, any>(
            this,
            {
                networks: computed.struct,
                selectedConnection: computed.struct,
            },
            { autoBind: true },
        )
    }

    public get networks(): Record<number, ConnectionData> {
        return this.rpcStore.state.networks
    }

    public get connectionConfig() {
        return this.config
    }

    public get connectionItems(): ConnectionDataItem[] {
        return Object.values(this.networks).sort((a, b) => (a.sortingOrder ?? Infinity) - (b.sortingOrder ?? Infinity))
    }

    public get decimals(): number {
        return this.selectedConnection.config.decimals ?? 9
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

    public get selectedConnectionConfig(): ConnectionDataItem {
        return this.selectedConnection
    }

    public get selectedConnectionNetworkType(): NetworkType {
        return this.selectedConnection.network ?? 'custom'
    }

    public get selectedConnectionNetworkGroup(): NetworkGroup {
        return this.selectedConnection.group
    }

    public get symbol(): string {
        return this.selectedConnectionConfig.config.symbol ?? NATIVE_CURRENCY_FALLBACK
    }

    public transactionExplorerLink(hash: string): string {
        const { config } = this.selectedConnectionConfig

        try {
            const base = formatBaseUrl(config.explorerBaseUrl ?? 'https://everscan.io')
            let path = `/transactions/${hash}`

            if (base.includes('ever.live') || base.includes('localhost')) {
                path = `/transactions/transactionDetails?id=${hash}`
            }

            if (this.selectedConnectionNetworkType === 'ton') {
                path = `/transaction/${hash}`
            }

            return new URL(path, base).toString()
        }
        catch (e) {
            console.error(e)
            return `https://everscan.io/transactions/${hash}`
        }
    }

    public accountExplorerLink(address: string): string {
        const { config } = this.selectedConnectionConfig

        try {
            const base = formatBaseUrl(config.explorerBaseUrl ?? 'https://everscan.io')
            let path = `/accounts/${address}`

            if (base.includes('ever.live') || base.includes('localhost')) {
                path = `/accounts/accountDetails?id=${address}`
            }

            if (this.selectedConnectionNetworkType === 'ton') {
                path = `/${this.nekoton.packAddress(address, true, true)}`
            }

            return new URL(path, base).toString()
        }
        catch (e) {
            console.error(e)
            return `https://everscan.io/accounts/${address}`
        }
    }

    public updateCustomNetwork(value: UpdateCustomNetwork): Promise<ConnectionDataItem> {
        return this.rpcStore.rpc.updateCustomNetwork(value)
    }

    public changeNetwork(network?: ConnectionDataItem): Promise<boolean> {
        return this.rpcStore.rpc.changeNetwork(network)
    }

    public deleteCustomNetwork(connectionId: string): Promise<ConnectionDataItem | undefined> {
        return this.rpcStore.rpc.deleteCustomNetwork(connectionId)
    }

}

const URL_SCHEME_REGEX = /^https?:\/\//i
function formatBaseUrl(baseUrl: string): string {
    if (!baseUrl.match(URL_SCHEME_REGEX)) {
        return `https://${baseUrl}`
    }
    return baseUrl
}
