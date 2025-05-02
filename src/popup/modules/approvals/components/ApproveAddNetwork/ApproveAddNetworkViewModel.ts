import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import type { GqlConnection, JrpcConnection, Network, ProtoConnection } from 'everscale-inpage-provider'

import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { ConnectionDataItem, PendingApproval } from '@app/models'
import { parseError } from '@app/popup/utils'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveAddNetworkViewModel {

    public switchNetwork = this.approval.requestData.switchNetwork

    public loading = false

    public error = ''

    public selectedAccount = this.accountability.selectedAccount

    constructor(
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get approval(): PendingApproval<'addNetwork'> {
        return this.approvalStore.approval as PendingApproval<'addNetwork'>
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public onSwitch(value: boolean): void {
        this.switchNetwork = value
    }

    public async onReject(): Promise<void> {
        this.loading = true
        await this.approvalStore.rejectPendingApproval()
    }

    public async onSubmit(): Promise<void> {
        const { addNetwork } = this.approval.requestData

        this.loading = true
        this.error = ''

        let connection: ConnectionDataItem | null = null
        try {
            connection = await this.rpcStore.rpc.updateCustomNetwork({
                name: addNetwork.name,
                config: addNetwork.config ?? {},
                ...getConnection(addNetwork.connection),
            })

            if (!connection.description) {
                throw new Error('Unable to get network description')
            }

            const network: Network = {
                name: connection.name,
                config: connection.config,
                connection: {
                    type: connection.type,
                    data: connection.data,
                },
                description: connection.description,
            }

            if (this.switchNetwork) {
                await this.rpcStore.rpc.changeNetwork(connection)
            }

            await this.approvalStore.resolvePendingApproval(network)
        }
        catch (e) {
            if (connection) {
                await this.rpcStore.rpc.deleteCustomNetwork(connection.id)
            }

            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}

function getConnection(connection: any): GqlConnection | JrpcConnection | ProtoConnection {
    if (!isSupportedConnection(connection)) throw new Error('Unsupported connection type')

    if (connection.type === 'graphql') {
        return {
            type: 'graphql',
            data: {
                endpoints: connection.data.endpoints,
                maxLatency: connection.data.maxLatency ?? 60000,
                latencyDetectionInterval: connection.data.latencyDetectionInterval ?? 60000,
                local: connection.data.local ?? false,
            },
        }
    }

    return connection
}

function isSupportedConnection(connection: any): connection is GqlConnection | JrpcConnection | ProtoConnection {
    return !!connection && (connection.type === 'graphql' || connection.type === 'jrpc' || connection.type === 'proto')
}
