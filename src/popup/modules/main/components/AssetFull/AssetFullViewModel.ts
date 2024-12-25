import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import type { DensContact, JettonSymbol, StoredBriefMessageInfo, TokenWalletTransaction } from '@app/models'
import { AccountabilityStore, ConnectionStore, createEnumField, LocalizationStore, NotificationStore, RpcStore, SelectableKeys, Token, TokensStore } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { getScrollWidth } from '@app/popup/utils'
import { isTokenSymbol, NATIVE_CURRENCY_DECIMALS, requiresSeparateDeploy, SelectedAsset } from '@app/shared'

@injectable()
export class AssetFullViewModel {

    public selectedAsset!: SelectedAsset

    public panel = createEnumField<typeof Panel>()

    public selectedTransactionHash: string | undefined

    public addressToVerify: string | undefined

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private contactsStore: ContactsStore,
        private tokensStore: TokensStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
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

    public get transactions(): TokenWalletTransaction[] | nt.TonWalletTransaction[] {
        if (this.selectedAsset.type === 'ever_wallet') {
            return this.accountability.selectedAccountTransactions
        }

        // eslint-disable-next-line max-len
        const tokenTransactions = this.accountability.selectedAccountTokenTransactions[this.selectedAsset.data.rootTokenContract]

        return tokenTransactions
            ?.filter(transaction => {
                const tokenTransaction = transaction as TokenWalletTransaction
                return !!tokenTransaction.info
            }) ?? []
    }

    public get selectedTransaction(): nt.Transaction | undefined {
        if (!this.selectedTransactionHash) return undefined

        return (this.transactions as nt.Transaction[]).find(({ id }) => id.hash === this.selectedTransactionHash)
    }

    public get knownTokens(): Record<string, nt.Symbol | JettonSymbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | JettonSymbol | undefined {
        return this.selectedAsset.type === 'token_wallet'
            ? this.knownTokens[this.selectedAsset.data.rootTokenContract]
            : undefined
    }

    public get token(): Token | undefined {
        return this.selectedAsset.type === 'token_wallet'
            ? this.tokensStore.tokens[this.selectedAsset.data.rootTokenContract]
            : undefined
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get currencyName(): string {
        return this.selectedAsset.type === 'ever_wallet'
            ? this.nativeCurrency
            : this.token?.symbol ?? this.symbol!.name
    }

    public get decimals(): number | undefined {
        return this.selectedAsset.type === 'ever_wallet' ? NATIVE_CURRENCY_DECIMALS : this.symbol?.decimals
    }

    public get old(): boolean {
        return this.selectedAsset.type === 'token_wallet' && isTokenSymbol(this.symbol) && this.symbol.version === 'OldTip3v4'
    }

    public get pendingTransactions(): StoredBriefMessageInfo[] | undefined {
        return this.selectedAsset.type === 'ever_wallet'
            ? this.accountability.selectedAccountPendingTransactions
            : undefined
    }

    public get accountDensContacts(): DensContact[] {
        return this.contactsStore.accountDensContacts
    }

    private get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys()
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
        if (this.everWalletState?.isDeployed && !this.selectableKeys.keys.length) {
            this.notification.show({
                type: 'action',
                action: this.localization.intl.formatMessage({ id: 'ADD_BTN_TEXT' }),
                message: this.localization.intl.formatMessage({ id: 'MULTISIG_ADD_CUSTODIANS_NOTIFICATION_TEXT' }),
                onAction: async () => {
                    await this.rpcStore.rpc.tempStorageInsert('manage_seeds', { step: 'create_seed' })
                    await this.rpcStore.rpc.openExtensionInExternalWindow({
                        group: 'manage_seeds',
                        width: 360 + getScrollWidth() - 1,
                        height: 600 + getScrollWidth() - 1,
                    })
                },
            })
            return
        }

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
