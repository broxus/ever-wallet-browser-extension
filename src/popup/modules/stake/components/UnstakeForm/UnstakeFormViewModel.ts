import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import type { FormEvent } from 'react'

import type { StakePrices, StEverVaultDetails } from '@app/models'
import { Logger, StakeStore, Utils } from '@app/popup/modules/shared'
import { amountPattern, parseCurrency, ST_EVER, ST_EVER_DECIMALS } from '@app/shared'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'
import { StakeTransferStore } from '../../store'

@injectable()
export class UnstakeFormViewModel {

    public onSubmit!: (data: StakeFromData) => void

    public loading = false

    public amount = ''

    public submitted = false

    public withdrawEverAmount = '0'

    public prices: StakePrices | undefined

    constructor(
        private transfer: StakeTransferStore,
        private stakeStore: StakeStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        if (transfer.messageParams?.originalAmount !== '0') {
            this.amount = transfer.messageParams?.originalAmount ?? ''
        }

        utils.autorun(() => {
            if (!this.decimals) return

            let amount = ''

            try {
                amount = parseCurrency(this.amount, this.decimals)
            }
            catch {}

            this.estimateDepositStEverAmount(amount).catch(logger.error)
        })

        this.getPrices().catch(logger.error)
    }

    public get balance(): string {
        return this.transfer.stEverBalance
    }

    public get error(): string | null {
        if (this.decimals) {
            const pattern = amountPattern(this.decimals)

            if (!this.amount) return 'required'
            if (!pattern.test(this.amount)) return 'pattern'
            if (!this.validateAmount(this.amount)) return 'invalidAmount'
            if (!this.validateBalance(this.amount)) return 'insufficientBalance'
        }

        return null
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

    public get maxAmount(): string {
        return this.balance
    }

    public get currencyName(): string {
        return ST_EVER
    }

    public get decimals(): number {
        return ST_EVER_DECIMALS
    }

    public get rootTokenContract(): string {
        return this.stakeStore.stEverTokenRoot
    }

    public get withdrawTimeHours(): number {
        return this.stakeStore.withdrawTimeHours
    }

    public handleInputChange(value: string): void {
        this.amount = value
    }

    public handleSubmit(e: FormEvent): void {
        e.preventDefault()

        this.submitted = true

        if (this.error) return

        this.onSubmit({
            amount: this.amount,
        })
    }

    public validateAmount(value?: string): boolean {
        try {
            const current = new BigNumber(
                parseCurrency(value || '', this.decimals),
            )

            return current.isGreaterThan(0)
        }
        catch (e: any) {
            return false
        }
    }

    public validateBalance(value?: string): boolean {
        try {
            const current = new BigNumber(
                parseCurrency(value || '', this.decimals),
            )
            return current.isLessThanOrEqualTo(this.balance)
        }
        catch (e: any) {
            return false
        }
    }

    private async estimateDepositStEverAmount(value: string): Promise<void> {
        if (!value) {
            runInAction(() => {
                this.withdrawEverAmount = '0'
            })
            return
        }

        try {
            const amount = await this.stakeStore.getWithdrawEverAmount(value)

            runInAction(() => {
                this.withdrawEverAmount = amount
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private async getPrices() {
        const prices = await this.stakeStore.getPrices()
        runInAction(() => {
            this.prices = prices
        })
    }

}
