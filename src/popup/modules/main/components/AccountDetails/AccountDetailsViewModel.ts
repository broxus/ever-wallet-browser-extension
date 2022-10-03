import type nt from '@wallet/nekoton-wasm'
import {
    makeAutoObservable,
    reaction,
    runInAction,
    when,
} from 'mobx'
import { Disposable, injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { BUY_EVER_URL, requiresSeparateDeploy } from '@app/shared'
import { getScrollWidth } from '@app/popup/utils'
import {
    AccountabilityStore,
    DrawerContext,
    Panel,
    RpcStore,
    StakeStore,
} from '@app/popup/modules/shared'

@injectable()
export class AccountDetailsViewModel implements Disposable {

    public drawer!: DrawerContext

    public carouselIndex = 0

    public loading = false

    private disposer: () => void

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
    ) {
        makeAutoObservable<AccountDetailsViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            stakeStore: false,
        }, { autoBind: true })

        this.carouselIndex = Math.max(this.selectedAccountIndex, 0)

        this.disposer = reaction(() => this.accountability.selectedAccountAddress, async () => {
            await when(() => this.selectedAccountIndex !== -1)

            runInAction(() => {
                this.carouselIndex = this.selectedAccountIndex
            })
        })
    }

    public dispose(): void | Promise<void> {
        this.disposer()
    }

    public get stakingAvailable(): boolean {
        return this.stakeStore.stakingAvailable
    }

    public get stakeBannerVisible(): boolean {
        return this.stakingAvailable && this.stakeStore.stakeBannerState === 'visible'
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public get accounts(): Array<{ account: nt.AssetsList, state: nt.ContractState | undefined }> {
        return this.accountability.accounts.map(account => ({
            account,
            state: this.accountability.accountContractStates[account.tonWallet.address],
        }))
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
        const account = this.accountability.accounts.length === index
            ? this.accountability.accounts[index - 1] // if not a last slide
            : this.accountability.accounts[index]

        this.carouselIndex = index

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

    public async hideBanner(): Promise<void> {
        await this.stakeStore.hideBanner()
    }

}
