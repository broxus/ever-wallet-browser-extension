import { computed, makeAutoObservable } from 'mobx'
import { inject, singleton } from 'tsyringe'

import { ConnectionData, ConnectionDataItem, type Nekoton, NetworkConfig, NetworkType, UpdateCustomNetwork } from '@app/models'
import { NATIVE_CURRENCY_FALLBACK } from '@app/shared'
import { NekotonToken } from '@app/popup/modules/shared/di-container'

import { RpcStore } from './RpcStore'

@singleton()
export class ConnectionStore {

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
    ) {
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

    public get selectedConnectionNetworkType(): NetworkType {
        return this.selectedConnection.network ?? 'custom'
    }

    public get symbol(): string {
        return this.selectedConnectionConfig.symbol ?? NATIVE_CURRENCY_FALLBACK
    }

    public transactionExplorerLink(hash: string): string {
        const { explorerBaseUrl } = this.selectedConnectionConfig

        try {
            const base = formatBaseUrl(explorerBaseUrl ?? 'https://everscan.io')
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
        const { explorerBaseUrl } = this.selectedConnectionConfig

        try {
            const base = formatBaseUrl(explorerBaseUrl ?? 'https://everscan.io')
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

    public deleteCustomNetwork(connectionId: number): Promise<ConnectionDataItem | undefined> {
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
