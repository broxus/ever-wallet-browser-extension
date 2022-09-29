import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { Disposable, inject, injectable } from 'tsyringe'
import type { FormEvent } from 'react'

import type { Nekoton, StEverVaultDetails } from '@app/models'
import { AccountabilityStore, NekotonToken, RpcStore, StakeStore } from '@app/popup/modules/shared'
import {
    amountPattern,
    Logger,
    parseCurrency,
    ST_EVER,
    ST_EVER_DECIMALS,
    TokenWalletState,
} from '@app/shared'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'

@injectable()
export class UnstakeFormViewModel implements Disposable {

    public selectedAccount!: nt.AssetsList

    public onSubmit!: (data: StakeFromData) => void

    public loading = false

    public amount = ''

    public submitted = false

    public withdrawEverAmount = '0'

    public balance = '0'

    private estimateDisposer: () => void

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private logger: Logger,
    ) {
        makeAutoObservable<UnstakeFormViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
            stakeStore: false,
            logger: false,
        }, { autoBind: true })

        this.estimateDisposer = autorun(() => {
            if (!this.decimals) return

            let amount = ''

            try {
                amount = parseCurrency(this.amount, this.decimals)
            }
            catch {}

            this.estimateDepositStEverAmount(amount).catch(logger.error)
        })
    }

    dispose(): Promise<void> | void {
        this.estimateDisposer()
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
        const stEverToEverRate = Decimal.div(stEverSupply, totalAssets)

        return Decimal.div(1, stEverToEverRate).toFixed(4)
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.accountTokenStates?.[this.selectedAccount.tonWallet.address] ?? {}
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
            const current = new Decimal(
                parseCurrency(value || '', this.decimals),
            )

            return current.greaterThan(0)
        }
        catch (e: any) {
            return false
        }
    }

    public validateBalance(value?: string): boolean {
        try {
            const current = new Decimal(
                parseCurrency(value || '', this.decimals),
            )
            return current.lessThanOrEqualTo(this.balance)
        }
        catch (e: any) {
            return false
        }
    }

    public setBalance(balance: string): void {
        this.balance = balance
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

}
