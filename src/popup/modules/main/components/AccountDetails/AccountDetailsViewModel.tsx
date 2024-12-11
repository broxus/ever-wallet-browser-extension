import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import browser from 'webextension-polyfill'
import BigNumber from 'bignumber.js'

import { BUY_EVER_URL, requiresSeparateDeploy } from '@app/shared'
import { getScrollWidth } from '@app/popup/utils'
import { AccountabilityStore, ConnectionStore, LocalizationStore, Logger, NekotonToken, NotificationStore, Router, RpcStore, SelectableKeys, SlidingPanelStore, StakeStore, Utils } from '@app/popup/modules/shared'
import { ConnectionDataItem, type Nekoton } from '@app/models'
import { DeployReceive, DeployWallet } from '@app/popup/modules/deploy'

@injectable()
export class AccountDetailsViewModel {

    public carouselIndex = 0

    public loading = false

    constructor(
        public panel: SlidingPanelStore,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private connectionStore: ConnectionStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private logger: Logger,
        private utils: Utils,
        @inject(NekotonToken) private nekoton: Nekoton,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.carouselIndex = Math.max(this.selectedAccountIndex, 0)

        utils.reaction(() => this.accountability.selectedAccountAddress, async () => {
            await when(() => this.selectedAccountIndex !== -1)

            runInAction(() => {
                this.carouselIndex = this.selectedAccountIndex
            })
        })
    }

    public get selectedCustodians(): string[] {
        return this.selectedAccountAddress
            ? this.accountability.accountCustodians[this.selectedAccountAddress] ?? []
            : []
    }

    public get selectedWalletInfo(): nt.TonWalletDetails | undefined {
        return this.selectedAccount
            ? this.nekoton.getContractTypeDefaultDetails(this.selectedAccount.tonWallet.contractType)
            : undefined
    }

    public get stakingAvailable(): boolean {
        return this.stakeStore.stakingAvailable
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.rpcStore.state.accountContractStates
    }

    public get accounts(): nt.AssetsList[] {
        return this.accountability.accounts
    }

    public get keysByMasterKey(): Record<string, nt.KeyStoreEntry[]> {
        return this.accountability.keysByMasterKey
    }

    public get accountsByPublicKey(): {[k: string]: nt.AssetsList[] | undefined} {
        return this.accountability.accountsByPublicKey
    }

    public get isDeployed(): boolean {
        return this.everWalletState?.isDeployed
            || !requiresSeparateDeploy(this.selectedAccount?.tonWallet.contractType)
    }

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    public get selectedAccountAddress(): string | undefined {
        return this.accountability.selectedAccountAddress
    }

    public get hasWithdrawRequest(): boolean {
        const address = this.selectedAccountAddress
        if (!address) return false
        return !!this.stakeStore.withdrawRequests[address]
            && Object.keys(this.stakeStore.withdrawRequests[address]).length > 0
    }

    private get selectedAccountIndex(): number {
        const address = this.selectedAccountAddress
        return this.accountability.accounts.findIndex(account => account.tonWallet.address === address)
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys()
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public async onBuy(): Promise<void> {
        await browser.tabs.create({
            url: BUY_EVER_URL,
            active: true,
        })
    }

    public async onDeploy(): Promise<void> {
        if (!this.selectedAccount) return

        const { selectedAccount: account, nativeCurrency, everWalletState } = this
        const balance = new BigNumber(everWalletState?.balance || '0')
        const fees = await this.estimateDeploymentFees(account.tonWallet.address)
        const amount = BigNumber.max(
            '100000000',
            new BigNumber('10000000').plus(fees ?? '0'),
        )

        if (!balance.isGreaterThanOrEqualTo(amount)) {
            this.panel.open({
                render: () => (
                    <DeployReceive
                        account={account}
                        totalAmount={amount.toString()}
                        currencyName={nativeCurrency}
                    />
                ),
            })
        }
        else {
            this.panel.open({
                render: () => <DeployWallet address={account.tonWallet.address} />,
            })
        }
    }

    public onSettings(): void {
        this.router.navigate('/profile')
    }

    public async onStake(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'stake',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
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

        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'send',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async onSlide(index: number): Promise<void> {
        this.carouselIndex = index

        const account = this.accountability.accounts.at(index)

        if (!account || account.tonWallet.address === this.accountability.selectedAccountAddress) {
            return
        }

        await this.accountability.selectAccount(account.tonWallet.address)
    }

    public async selectAccount(address: string): Promise<void> {
        await this.accountability.selectAccount(address)
    }

    public async removeAccount(): Promise<void> {
        if (this.loading || !this.selectedAccountAddress) return
        this.loading = true

        try {
            const address = this.selectedAccountAddress
            const account = this.accountability.accountEntries[address]

            await this.rpcStore.rpc.removeAccount(address)
            this.showDeleteNotification(account)
        }
        catch (e) {
            console.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async openAccountInExplorer(): Promise<void> {
        if (!this.selectedAccountAddress) return
        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(this.selectedAccountAddress),
            active: false,
        })
    }

    public async openNetworkSettings(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'network_settings',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async hideAccount(address: string): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            await this.rpcStore.rpc.updateAccountVisibility(address, false)
            this.showHideNotification(address)
        }
        catch (e) {
            console.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private showDeleteNotification(account: nt.AssetsList): void {
        this.notification.show({
            message: this.localization.intl.formatMessage({ id: 'REMOVE_ACCOUNT_SUCCESS_NOTIFICATION' }),
            action: this.localization.intl.formatMessage({ id: 'UNDO_BTN_TEXT' }),
            onAction: async () => {
                await this.rpcStore.rpc.createAccount({
                    name: account.name,
                    contractType: account.tonWallet.contractType,
                    publicKey: account.tonWallet.publicKey,
                    explicitAddress: account.tonWallet.address,
                    workchain: 0,
                })
            },
        })
    }

    private showHideNotification(address: string): void {
        this.notification.show({
            message: this.localization.intl.formatMessage({ id: 'HIDE_ACCOUNT_SUCCESS_NOTIFICATION' }),
            action: this.localization.intl.formatMessage({ id: 'UNDO_BTN_TEXT' }),
            onAction: () => this.rpcStore.rpc.updateAccountVisibility(address, true),
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

}
