import browser from 'webextension-polyfill'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import type { StEverVaultDetails, WithdrawRequest } from '@app/models'
import { ConnectionStore, SlidingPanelHandle, StakeStore } from '@app/popup/modules/shared'
import { ST_EVER, ST_EVER_DECIMALS } from '@app/shared'

import { StakeTransferStore } from '../../store'

@injectable()
export class WithdrawInfoViewModel {

    public withdrawRequest!: WithdrawRequest

    constructor(
        public transfer: StakeTransferStore,
        private handle: SlidingPanelHandle,
        private stakeStore: StakeStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get timestamp(): number {
        const [, { timestamp }] = this.withdrawRequest
        return parseInt(timestamp, 10) * 1000
    }

    public get amount(): string {
        const [, { amount }] = this.withdrawRequest
        return amount
    }

    public get currencyName(): string {
        return ST_EVER
    }

    public get decimals(): number {
        return ST_EVER_DECIMALS
    }

    public get stakeDetails(): StEverVaultDetails | undefined {
        return this.stakeStore.details
    }

    public get exchangeRate(): string | undefined {
        if (!this.stakeDetails) return undefined

        const { stEverSupply, totalAssets } = this.stakeDetails
        const stEverToEverRate = new BigNumber(stEverSupply).div(totalAssets)

        return new BigNumber(1).div(stEverToEverRate).toFixed(4)
    }

    public get receive(): string | undefined {
        if (!this.exchangeRate) return undefined
        return new BigNumber(this.amount).times(this.exchangeRate).toFixed()
    }

    public get withdrawTimeHours(): number {
        return this.stakeStore.withdrawTimeHours
    }

    public close(): void {
        this.handle.close()
    }

    public async openInExplorer(address: string): Promise<void> {
        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(address),
            active: false,
        })
    }

}
