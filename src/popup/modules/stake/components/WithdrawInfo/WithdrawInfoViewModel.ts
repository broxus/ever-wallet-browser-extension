import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import Decimal from 'decimal.js'

import type { StEverVaultDetails, WithdrawRequest } from '@app/models'
import { AccountabilityStore, StakeStore } from '@app/popup/modules/shared'
import { ST_EVER, ST_EVER_DECIMALS } from '@app/shared'

@injectable()
export class WithdrawInfoViewModel {

    public selectedAccount!: nt.AssetsList

    public withdrawRequest!: WithdrawRequest

    constructor(
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
    ) {
        makeAutoObservable<WithdrawInfoViewModel, any>(this, {
            accountability: false,
            stakeStore: false,
        }, { autoBind: true })
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
        const stEverToEverRate = Decimal.div(stEverSupply, totalAssets)

        return Decimal.div(1, stEverToEverRate).toFixed(4)
    }

    public get receive(): string | undefined {
        if (!this.exchangeRate) return undefined
        return Decimal.mul(this.amount, this.exchangeRate).toFixed()
    }

}
