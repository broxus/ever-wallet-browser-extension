import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { BUY_EVER_URL, requiresSeparateDeploy } from '@app/shared'
import { getScrollWidth } from '@app/popup/utils'
import {
    AccountabilityStore,
    ConnectionStore,
    Drawer,
    Panel,
    RpcStore,
    StakeStore,
    Utils,
} from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'

@injectable()
export class AccountDetailsViewModel {

    public carouselIndex = 0

    public loading = false

    constructor(
        public drawer: Drawer,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private connectionStore: ConnectionStore,
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
            || !requiresSeparateDeploy(this.accountability.selectedAccount?.tonWallet.contractType)
    }

    public get hasWithdrawRequest(): boolean {
        const address = this.accountability.selectedAccountAddress
        if (!address) return false
        return !!this.stakeStore.withdrawRequests[address]
            && Object.keys(this.stakeStore.withdrawRequests[address]).length > 0
    }

    private get selectedAccountIndex(): number {
        const address = this.accountability.selectedAccountAddress
        return this.accountability.accounts.findIndex(account => account.tonWallet.address === address)
    }

    public async onBuy(): Promise<void> {
        await browser.tabs.create({
            url: BUY_EVER_URL,
            active: true,
        })
    }

    public onReceive(): void {
        this.drawer.setPanel(Panel.RECEIVE)
    }

    public onDeploy(): void {
        this.drawer.setPanel(Panel.DEPLOY)
    }

    public async onStake(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'stake',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async onSend(): Promise<void> {
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

    public addAccount(): void {
        const masterKey = this.accountability.masterKeys.find(
            key => key.masterKey === this.accountability.selectedMasterKey,
        )

        this.accountability.setCurrentMasterKey(masterKey)
        this.drawer.setPanel(Panel.CREATE_ACCOUNT)
    }

    public async removeAccount(address: string): Promise<void> {
        if (this.loading) return

        this.loading = true

        try {
            await this.rpcStore.rpc.removeAccount(address)
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

    public openChangeAccount(): void {
        this.drawer.setPanel(Panel.CHANGE_ACCOUNT)
    }

    public async openAccountInExplorer(address: string): Promise<void> {
        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(address),
            active: false,
        })
    }

}
