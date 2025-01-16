import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import type * as nt from '@broxus/ever-wallet-wasm'
import browser from 'webextension-polyfill'
import BigNumber from 'bignumber.js'

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
    StakeStore,
} from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'
import { BUY_EVER_URL, requiresSeparateDeploy } from '@app/shared'
import { DeployReceive, DeployWallet } from '@app/popup/modules/deploy'
import { getScrollWidth } from '@app/popup/utils'

@injectable()
export class DashboardViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private connectionStore: ConnectionStore,
        private accountability: AccountabilityStore,
        private router: Router,
        private rpcStore: RpcStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private stakeStore: StakeStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
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

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    public get selectedAccountAddress(): string | undefined {
        return this.accountability.selectedAccountAddress
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys()
    }

    public get isDeployed(): boolean {
        return (
            this.everWalletState?.isDeployed || !requiresSeparateDeploy(this.selectedAccount?.tonWallet.contractType)
        )
    }

    public get stakingAvailable(): boolean {
        return this.stakeStore.stakingAvailable
    }

    public get hasWithdrawRequest(): boolean {
        const address = this.accountability.selectedAccountAddress
        if (!address) return false
        return !!this.stakeStore.withdrawRequests[address]
            && Object.keys(this.stakeStore.withdrawRequests[address]).length > 0
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
        const amount = BigNumber.max('100000000', new BigNumber('10000000').plus(fees ?? '0'))

        if (!balance.isGreaterThanOrEqualTo(amount)) {
            this.panel.open({
                showClose: false,
                render: () => (
                    <DeployReceive account={account} totalAmount={amount.toString()} currencyName={nativeCurrency} />
                ),
            })
        }
        else {
            this.panel.open({
                showClose: false,
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
