import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { SelectedAsset, transactionExplorerLink } from '@app/shared'
import {
    AccountabilityStore, DrawerContext, Panel, RpcStore,
} from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'

@injectable()
export class MainPageViewModel {

    public selectedTransaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined

    public selectedAsset: SelectedAsset | undefined

    public drawer!: DrawerContext

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<MainPageViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get selectedAccount(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
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

}
