import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'
import BigNumber from 'bignumber.js'

import type { StEverVaultDetails, WithdrawRequest } from '@app/models'
import { StakeStore } from '@app/popup/modules/shared'
import { ST_EVER, ST_EVER_DECIMALS } from '@app/shared'

import { StakeTransferStore } from '../../store'

@singleton()
export class WithdrawInfoViewModel {

    public withdrawRequest!: WithdrawRequest

    public onRemove!: (value:WithdrawRequest)=> void

    constructor(
        public transfer: StakeTransferStore,
        private stakeStore: StakeStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public setWithdrawRequest(withdrawRequest: WithdrawRequest, onRemove:(value:WithdrawRequest)=> void): void {
        this.withdrawRequest = withdrawRequest
        this.onRemove = onRemove
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

    public get stEverTokenRoot(): string {
        return this.stakeStore.stEverTokenRoot
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

}
