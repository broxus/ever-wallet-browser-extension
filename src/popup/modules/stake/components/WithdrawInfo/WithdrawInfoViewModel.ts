import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import type { StEverVaultDetails, WithdrawRequest } from '@app/models'
import { AccountabilityStore, ConnectionStore, StakeStore } from '@app/popup/modules/shared'
import { ST_EVER_DECIMALS } from '@app/shared'

@injectable()
export class WithdrawInfoViewModel {

    public selectedAccount!: nt.AssetsList

    public withdrawRequest!: WithdrawRequest

    constructor(
        private accountability: AccountabilityStore,
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

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get tokenCurrency(): string {
        return this.stakeStore.config!.tokenSymbol
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

}
