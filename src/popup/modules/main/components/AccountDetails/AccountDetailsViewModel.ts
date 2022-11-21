import type nt from '@wallet/nekoton-wasm'
import {
    makeAutoObservable,
    reaction,
    runInAction,
    when,
} from 'mobx'
import { Disposable, injectable } from 'tsyringe'
import browser from 'webextension-polyfill'
import { MouseEvent } from 'react'
import Decimal from 'decimal.js'

import {
    BUY_EVER_URL,
    convertCurrency,
    convertEvers,
    requiresSeparateDeploy,
    TokenWalletState,
} from '@app/shared'
import { getScrollWidth } from '@app/popup/utils'
import {
    AccountabilityStore,
    DrawerContext,
    Panel,
    RpcStore,
    StakeStore,
    TokensStore,
} from '@app/popup/modules/shared'
import { ConnectionDataItem } from '@app/models'

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
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable<AccountDetailsViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            stakeStore: false,
            tokensStore: false,
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

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.rpcStore.state.accountContractStates
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.tokenWalletStates
    }

    public get accountDetails(): Record<string, nt.TonWalletDetails> {
        return this.accountability.accountDetails
    }

    public get accountCustodians(): Record<string, string[]> {
        return this.accountability.accountCustodians
    }

    public get accounts(): Array<AccountInfo> {
        return this.accountability.accounts.map(account => ({
            account,
            custodians: this.accountCustodians[account.tonWallet.address],
            details: this.accountDetails[account.tonWallet.address],
            total: this.getTotalUsdt(account),
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

    public async hideBanner(e: MouseEvent): Promise<void> {
        e.stopPropagation()
        await this.stakeStore.hideBanner()
    }

    private getTotalUsdt(account: nt.AssetsList): string {
        const { meta, prices, everPrice } = this.tokensStore
        const balance = this.accountContractStates[account.tonWallet.address]?.balance

        if (!everPrice || !balance) return ''

        const assets = account.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
        const assetsUsdtTotal = assets.reduce((sum, { rootTokenContract }) => {
            const token = meta[rootTokenContract]
            const price = prices[rootTokenContract]
            const state = this.tokenWalletStates[rootTokenContract]

            if (token && price && state) {
                const usdt = Decimal.mul(convertCurrency(state.balance, token.decimals), price)
                return Decimal.sum(usdt, sum)
            }

            return sum
        }, new Decimal(0))

        return Decimal.sum(
            Decimal.mul(convertEvers(balance), everPrice),
            assetsUsdtTotal,
        ).toFixed()
    }

}

type AccountInfo = {
    account: nt.AssetsList;
    details?: nt.TonWalletDetails;
    custodians?: string[];
    total: string;
}
