import type nt from '@wallet/nekoton-wasm'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { Logger, SelectedAsset, transactionExplorerLink } from '@app/shared'
import { AccountabilityStore, DrawerContext, Panel, RpcStore } from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'

@injectable()
export class MainPageViewModel {

    public selectedTransaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined

    public selectedAsset: SelectedAsset | undefined

    public drawer!: DrawerContext

    private networks: ConnectionDataItem[] = []

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable<MainPageViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            logger: false,
        }, { autoBind: true })

        autorun(() => {
            if (this.showConnectionError) {
                this.drawer.setPanel(Panel.CONNECTION_ERROR)
            }
        })

        this.getAvailableNetworks().catch(this.logger.error)
    }

    public get selectedAccount(): nt.AssetsList {
        return this.accountability.selectedAccount!
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

    public get showConnectionError(): boolean {
        return !!this.failedConnection && !this.pendingConnection
    }

    public get availableConnections(): ConnectionDataItem[] {
        return this.networks.filter((item) => item.group !== this.failedConnection?.group)
    }

    public setSelectedTransaction(transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined): void {
        this.selectedTransaction = transaction
    }

    public setSelectedAsset(asset: SelectedAsset | undefined): void {
        this.selectedAsset = asset
    }

    public reset(): void {
        this.setSelectedTransaction(undefined)
        this.setSelectedAsset(undefined)
        this.accountability.reset()
    }

    public closePanel(): void {
        this.reset()
        this.drawer.setPanel(undefined)
    }

    public showTransaction(transaction: nt.Transaction): void {
        this.setSelectedTransaction(transaction)
        this.drawer.setPanel(Panel.TRANSACTION)
    }

    public showAsset(selectedAsset: SelectedAsset): void {
        this.setSelectedAsset(selectedAsset)
        this.drawer.setPanel(Panel.ASSET)
    }

    public async openTransactionInExplorer(hash: string): Promise<void> {
        const network = this.selectedConnection.group

        await browser.tabs.create({
            url: transactionExplorerLink({ network, hash }),
            active: false,
        })
    }

    public async changeNetwork(network: ConnectionDataItem): Promise<void> {
        try {
            await this.rpcStore.rpc.changeNetwork(network)
            this.drawer.setPanel(undefined)
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private async getAvailableNetworks(): Promise<void> {
        const networks = await this.rpcStore.rpc.getAvailableNetworks()

        runInAction(() => {
            this.networks = networks
        })
    }

}
