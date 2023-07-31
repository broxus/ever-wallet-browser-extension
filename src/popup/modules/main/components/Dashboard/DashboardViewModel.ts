import type * as nt from '@broxus/ever-wallet-wasm'
import { autorun, makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, Drawer, Logger, Panel, RpcStore } from '@app/popup/modules/shared'
import { ConnectionDataItem, NftCollection } from '@app/models'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class DashboardViewModel {

    public selectedTransaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined

    public selectedNftCollection: NftCollection | undefined

    public addressToVerify: string | undefined

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        autorun(() => {
            if (this.showConnectionError) {
                this.drawer.setPanel(Panel.CONNECTION_ERROR)
            }
        })
    }

    public get selectedAccount(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get selectedKey(): nt.KeyStoreEntry {
        return this.accountability.storedKeys[this.selectedAccount.tonWallet.publicKey]
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

    public get availableConnections(): ConnectionDataItem[] {
        return this.connectionStore.connectionItems
            .filter((item) => item.group !== this.failedConnection?.group)
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public setSelectedTransaction(transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined): void {
        this.selectedTransaction = transaction
    }

    public setSelectedNftCollection(collection: NftCollection | undefined): void {
        this.selectedNftCollection = collection
    }

    public verifyAddress(address: string): void {
        this.addressToVerify = address
        this.drawer.setPanel(Panel.VERIFY_ADDRESS)
    }

    public async openNetworkSettings(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'network_settings',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public reset(): void {
        this.setSelectedTransaction(undefined)
        this.accountability.reset()
    }

    public closePanel(): void {
        this.reset()
        this.drawer.close()
    }

    public showNftCollection(collection: NftCollection): void {
        this.setSelectedNftCollection(collection)
        this.drawer.setPanel(Panel.NFT_COLLECTION)
    }

    public showNftImport(): void {
        this.drawer.setPanel(Panel.NFT_IMPORT)
    }

    public async changeNetwork(network: ConnectionDataItem): Promise<void> {
        try {
            await this.connectionStore.changeNetwork(network)
            this.drawer.close()
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}
