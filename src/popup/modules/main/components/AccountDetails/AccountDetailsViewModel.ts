import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { BUY_EVER_URL, requiresSeparateDeploy } from '@app/shared'
import { getScrollWidth } from '@app/popup/utils'
import { AccountabilityStore, ConnectionStore, LocalizationStore, NotificationStore, Router, RpcStore, SelectableKeys, SlidingPanelStore, StakeStore, Utils } from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'

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
        private utils: Utils,
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

    public async onBuy(): Promise<void> {
        await browser.tabs.create({
            url: BUY_EVER_URL,
            active: true,
        })
    }

    public onDeploy(): void {
        this.router.navigate(`/deploy/${this.selectedAccountAddress}`)
    }

    public onSettings(): void {
        this.router.navigate('/settings')
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

        await this.rpcStore.rpc.selectAccount(account.tonWallet.address)
    }

    public async addAccount(): Promise<void> {
        await this.rpcStore.rpc.tempStorageInsert('manage_seeds', { step: 'create_account' })
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'manage_seeds',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async removeAccount(address: string): Promise<void> {
        if (this.loading) return

        this.loading = true

        try {
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

    public async openAccountInExplorer(address: string): Promise<void> {
        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(address),
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

}
