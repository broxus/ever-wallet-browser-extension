import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import type { StoredBriefMessageInfo } from '@app/models'
import { AccountabilityStore, ConnectionStore, LocalizationStore, NotificationStore, type Router, RouterToken, RpcStore, SelectableKeys, SlidingPanelStore, Token, TokensStore } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'
import { convertCurrency, convertEvers, formatCurrency, NATIVE_CURRENCY_DECIMALS, requiresSeparateDeploy, SelectedAsset } from '@app/shared'

@injectable()
export class AssetFullViewModel {

    public selectedAsset: SelectedAsset

    constructor(
        public panel: SlidingPanelStore,
        @inject(RouterToken) private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        const root = router.state.matches.at(-1)?.params?.root
        this.selectedAsset = root
            ? { type: 'token_wallet', data: { rootTokenContract: root }}
            : { type: 'ever_wallet', data: { address: this.account.tonWallet.address }}
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

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | undefined {
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

    public get pendingTransactions(): StoredBriefMessageInfo[] | undefined {
        return this.selectedAsset.type === 'ever_wallet'
            ? this.accountability.selectedAccountPendingTransactions
            : undefined
    }

    private get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys()
    }

    public get balanceUsd(): string | undefined {
        let result: string | undefined
        const { tokens, prices, everPrice } = this.tokensStore

        if (this.selectedAsset.type === 'ever_wallet') {
            const balance = this.everWalletState?.balance
            if (everPrice && balance) {
                result = BigNumber(convertEvers(balance)).times(everPrice).toFixed()
            }
        }
        else {
            const { rootTokenContract } = this.selectedAsset.data
            const token = tokens[rootTokenContract]
            const price = prices[rootTokenContract]
            const state = this.accountability.tokenWalletStates?.[rootTokenContract]

            if (token && price && state) {
                result = new BigNumber(convertCurrency(state.balance, token.decimals)).times(price).toFixed()
            }
        }

        return result ? formatCurrency(result) : undefined
    }

    public showTransaction(transaction: nt.Transaction): void {
        const { hash } = transaction.id
        this.router.navigate(`/transactions/${hash}`, {
            state: { selectedAsset: this.selectedAsset },
        })
    }

    public preloadTransactions({ lt }: nt.TransactionId): Promise<void> {
        if (this.selectedAsset.type === 'ever_wallet') {
            return this.rpcStore.rpc.preloadTransactions(this.everWalletAsset.address, lt)
        }

        const { rootTokenContract } = this.selectedAsset.data
        return this.rpcStore.rpc.preloadTokenTransactions(this.everWalletAsset.address, rootTokenContract, lt)
    }

    public async onSend(): Promise<void> {
        if (this.everWalletState?.isDeployed && !this.selectableKeys.keys.length) {
            this.notification.show({
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
    }

}
