import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'
import type { Network } from 'everscale-inpage-provider'

import { AccountabilityStore, Logger, RpcStore } from '@app/popup/modules/shared'
import { ConnectionDataItem, PendingApproval } from '@app/models'

import { ApprovalStore, StandaloneStore } from '../../store'

@injectable()
export class ApproveChangeNetworkViewModel {

    public networks: ConnectionDataItem[] = []

    public selectedNetwork: ConnectionDataItem | undefined

    public selectedAccount = this.accountability.selectedAccount

    public loading = false

    constructor(
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private standaloneStore: StandaloneStore,
        private logger: Logger,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
        this.getNetworks()
    }

    public get approval(): PendingApproval<'changeNetwork'> {
        return this.approvalStore.approval as PendingApproval<'changeNetwork'>
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get providerNetwork(): Network | null {
        if (!this.selectedNetwork) return null

        return {
            name: this.selectedNetwork.name,
            config: this.selectedNetwork.config,
            connection: {
                type: this.selectedNetwork.type,
                data: this.selectedNetwork.data,
            },
            description: this.selectedNetwork.description!,
        }
    }

    public async onReject(): Promise<void> {
        this.loading = true
        await this.approvalStore.rejectPendingApproval()
    }

    public async onSubmit(): Promise<void> {
        if (!this.selectedNetwork) return

        this.loading = true

        try {
            const connected = await this.rpcStore.rpc.changeNetwork(this.selectedNetwork)

            if (connected) {
                await this.tryWaitForNetwork(this.selectedNetwork.id)
                await this.approvalStore.resolvePendingApproval(this.providerNetwork)
            }
            else {
                await this.approvalStore.resolvePendingApproval(null)
            }
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public onNetworkSelect(id: string) {
        this.selectedNetwork = this.networks.find((network) => network.id === id)
    }

    private async getNetworks(): Promise<void> {
        const { networkId } = this.approval.requestData
        const networks = await this.rpcStore.rpc.getAvailableNetworks()

        runInAction(() => {
            this.networks = networks.filter((network) => network.description?.globalId === networkId)
            this.selectedNetwork = this.networks.at(0)
        })
    }

    private async tryWaitForNetwork(connectionId: string) {
        try {
            await when(
                () => this.standaloneStore.state.selectedConnection.id === connectionId,
                { timeout: 10_000 },
            )
        }
        catch (e) {
            this.logger.warn('[ApproveChangeNetworkViewModel]', e)
        }
    }

}
