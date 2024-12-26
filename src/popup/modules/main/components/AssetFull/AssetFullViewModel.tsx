import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import type { JettonSymbol, StoredBriefMessageInfo, TokenWalletTransaction } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    LocalizationStore,
    Logger,
    NotificationStore,
    Router,
    RpcStore,
    SelectableKeys,
    SlidingPanelStore,
    Token,
    TokensStore,
} from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'
import {
    convertCurrency,
    convertEvers,
    NATIVE_CURRENCY,
    NATIVE_CURRENCY_DECIMALS,
    requiresSeparateDeploy,
    SelectedAsset,
    isTokenSymbol,
} from '@app/shared'
import { DeployReceive, DeployWallet } from '@app/popup/modules/deploy'

@injectable()
export class AssetFullViewModel {

    public selectedAsset: SelectedAsset

    constructor(
        public panel: SlidingPanelStore,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        const root = router.state.matches.at(-1)?.params?.root
        this.selectedAsset = root && root !== 'native'
            ? { type: 'token_wallet', data: { rootTokenContract: root }}
            : { type: 'ever_wallet', data: { address: this.account.tonWallet.address }}
    }

    public get root(): string | undefined {
        return this.router.state.matches.at(-1)?.params?.root
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
                || (!this.everWalletState.isDeployed && requiresSeparateDeploy(this.everWalletAsset.contractType))
            )
        }

        return false
    }

    public get showSendButton(): boolean {
        return (
            !!this.everWalletState
            && (this.balance || '0') !== '0'
            && (this.selectedAsset.type === 'ever_wallet'
                || this.everWalletState.isDeployed
                || !requiresSeparateDeploy(this.everWalletAsset.contractType))
        )
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

        return (
            tokenTransactions?.filter((transaction) => {
                const tokenTransaction = transaction as TokenWalletTransaction
                return !!tokenTransaction.info
            }) ?? []
        )
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

    public get currencyName(): string | undefined {
        return this.selectedAsset.type === 'ever_wallet'
            ? this.nativeCurrency
            : this.token?.symbol ?? this.symbol?.name
    }

    public get currencyFullName(): string | undefined {
        return this.selectedAsset.type === 'ever_wallet' ? NATIVE_CURRENCY : this.token?.name ?? this.symbol?.fullName
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

        return result
    }

    public preloadTransactions({ lt }: nt.TransactionId): Promise<void> {
        if (this.selectedAsset.type === 'ever_wallet') {
            return this.rpcStore.rpc.preloadTransactions(this.everWalletAsset.address, lt)
        }

        const { rootTokenContract } = this.selectedAsset.data
        return this.rpcStore.rpc.preloadTokenTransactions(this.everWalletAsset.address, rootTokenContract, lt)
    }

    public async onDeploy(): Promise<void> {
        if (this.selectedAsset.type !== 'ever_wallet') return

        const { account, nativeCurrency, everWalletState } = this
        const balance = new BigNumber(everWalletState?.balance || '0')
        const fees = await this.estimateDeploymentFees(account.tonWallet.address)
        const amount = BigNumber.max('100000000', new BigNumber('10000000').plus(fees ?? '0'))

        if (!balance.isGreaterThanOrEqualTo(amount)) {
            this.panel.open({
                render: () => (
                    <DeployReceive account={account} totalAmount={amount.toString()} currencyName={nativeCurrency} />
                ),
            })
        }
        else {
            this.panel.open({
                render: () => <DeployWallet address={account.tonWallet.address} />,
            })
        }
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

    private async estimateDeploymentFees(address: string): Promise<string | null> {
        try {
            return await this.rpcStore.rpc.estimateDeploymentFees(address)
        }
        catch (e) {
            this.logger.error(e)
            return null
        }
    }

    public get old(): boolean {
        return isTokenSymbol(this.symbol) && this.symbol?.version === 'OldTip3v4'
    }

}
