import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { ConnectionDataItem, Nekoton } from '@app/models'
import {
    AccountabilityStore, createEnumField, NekotonToken, RpcStore,
} from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'
import { SelectedAsset, transactionExplorerLink } from '@app/shared'

@injectable()
export class AssetFullViewModel {

    public selectedAsset!: SelectedAsset

    public panel = createEnumField(Panel)

    public selectedTransactionHash: string | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<AssetFullViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get account(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.account.tonWallet
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public get shouldDeploy(): boolean {
        if (this.selectedAsset.type === 'ever_wallet') {
            return (
                !this.everWalletState
                || (!this.everWalletState.isDeployed
                    && this.nekoton.getContractTypeDetails(this.everWalletAsset.contractType).requiresSeparateDeploy)
            )
        }

        return false
    }

    public get showSendButton(): boolean {
        return !!this.everWalletState
            && (this.balance || '0') !== '0'
            && (this.selectedAsset.type === 'ever_wallet'
                || this.everWalletState.isDeployed
                || !this.nekoton.getContractTypeDetails(this.everWalletAsset.contractType).requiresSeparateDeploy)
    }

    public get balance(): string | undefined {
        if (this.selectedAsset.type === 'ever_wallet') {
            return this.everWalletState?.balance
        }

        const { rootTokenContract } = this.selectedAsset.data
        return this.accountability.tokenWalletStates?.[rootTokenContract]?.balance
    }

    public get transactions(): nt.TokenWalletTransaction[] | nt.TonWalletTransaction[] {
        if (this.selectedAsset.type === 'ever_wallet') {
            return this.accountability.selectedAccountTransactions
        }

        // eslint-disable-next-line max-len
        const tokenTransactions = this.accountability.selectedAccountTokenTransactions[this.selectedAsset.data.rootTokenContract]

        return tokenTransactions
            ?.filter(transaction => {
                const tokenTransaction = transaction as nt.TokenWalletTransaction
                return !!tokenTransaction.info
            }) ?? []
    }

    public get selectedTransaction(): nt.Transaction | undefined {
        if (!this.selectedTransactionHash) return undefined

        return (this.transactions as nt.Transaction[]).find(({ id }) => id.hash === this.selectedTransactionHash)
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | undefined {
        if (this.selectedAsset.type === 'ever_wallet') {
            return undefined
        }

        return this.knownTokens[this.selectedAsset.data.rootTokenContract]
    }

    public closePanel(): void {
        this.selectedTransactionHash = undefined
        this.panel.setValue(undefined)
    }

    public showTransaction(transaction: nt.Transaction): void {
        this.selectedTransactionHash = transaction.id.hash
        this.panel.setTransaction()
    }

    public async openTransactionInExplorer(hash: string): Promise<void> {
        const network = this.selectedConnection.group

        await browser.tabs.create({
            url: transactionExplorerLink({ network, hash }),
            active: false,
        })
    }

    public preloadTransactions({ lt }: nt.TransactionId): Promise<void> {
        if (this.selectedAsset.type === 'ever_wallet') {
            return this.rpcStore.rpc.preloadTransactions(this.everWalletAsset.address, lt)
        }

        const { rootTokenContract } = this.selectedAsset.data
        return this.rpcStore.rpc.preloadTokenTransactions(this.everWalletAsset.address, rootTokenContract, lt)
    }

    public onReceive(): void {
        this.panel.setReceive()
    }

    public onDeploy(): void {
        this.panel.setDeploy()
    }

    public async onSend(): Promise<void> {
        await this.rpcStore.rpc.tempStorageInsert('selected_asset', this.selectedAsset)
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'send',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })

        this.panel.setValue(undefined)
    }

}

export enum Panel {
    Receive,
    Deploy,
    Transaction,
}
