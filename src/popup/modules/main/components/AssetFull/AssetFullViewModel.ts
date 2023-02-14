import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import type { Nekoton, StoredBriefMessageInfo } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    NekotonToken,
    RpcStore,
} from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'
import { NATIVE_CURRENCY_DECIMALS, requiresSeparateDeploy, SelectedAsset } from '@app/shared'

@injectable()
export class AssetFullViewModel {

    public selectedAsset!: SelectedAsset

    public panel = createEnumField<typeof Panel>()

    public selectedTransactionHash: string | undefined

    public addressToVerify: string | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get key(): nt.KeyStoreEntry {
        return this.accountability.storedKeys[this.account.tonWallet.publicKey]
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
                    && requiresSeparateDeploy(this.everWalletAsset.contractType))
            )
        }

        return false
    }

    public get showSendButton(): boolean {
        return !!this.everWalletState
            && (this.balance || '0') !== '0'
            && (this.selectedAsset.type === 'ever_wallet'
                || this.everWalletState.isDeployed
                || !requiresSeparateDeploy(this.everWalletAsset.contractType))
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

    public get currencyName(): string {
        return this.selectedAsset.type === 'ever_wallet' ? this.connectionStore.symbol : this.symbol!.name
    }

    public get decimals(): number | undefined {
        return this.selectedAsset.type === 'ever_wallet' ? NATIVE_CURRENCY_DECIMALS : this.symbol?.decimals
    }

    public get old(): boolean {
        return this.selectedAsset.type === 'token_wallet' && this.symbol?.version !== 'Tip3'
    }

    public get pendingTransactions(): StoredBriefMessageInfo[] {
        return this.accountability.selectedAccountPendingTransactions
    }

    public closePanel(): void {
        this.selectedTransactionHash = undefined
        this.panel.setValue(undefined)
    }

    public showTransaction(transaction: nt.Transaction): void {
        this.selectedTransactionHash = transaction.id.hash
        this.panel.setValue(Panel.Transaction)
    }

    public async openTransactionInExplorer(hash: string): Promise<void> {
        await browser.tabs.create({
            url: this.connectionStore.transactionExplorerLink(hash),
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
        this.panel.setValue(Panel.Receive)
    }

    public onDeploy(): void {
        this.panel.setValue(Panel.Deploy)
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

    public verifyAddress(address: string): void {
        this.addressToVerify = address
        this.panel.setValue(Panel.VerifyAddress)
    }

}

export enum Panel {
    Receive,
    Deploy,
    Transaction,
    VerifyAddress,
}
