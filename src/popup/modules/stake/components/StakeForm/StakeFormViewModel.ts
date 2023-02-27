import type nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'
import type { FormEvent } from 'react'

import type { Nekoton, StEverVaultDetails } from '@app/models'
import { AccountabilityStore, Logger, NekotonToken, RpcStore, StakeStore, Utils } from '@app/popup/modules/shared'
import {
    amountPattern,
    NATIVE_CURRENCY,
    NATIVE_CURRENCY_DECIMALS,
    parseCurrency,
    parseEvers,
    STAKE_DEPOSIT_ATTACHED_AMOUNT,
} from '@app/shared'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'

@injectable()
export class StakeFormViewModel {

    public selectedAccount!: nt.AssetsList

    public onSubmit!: (data: StakeFromData) => void

    public loading = false

    public amount = ''

    public submitted = false

    public depositStEverAmount = '0'

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.autorun(() => {
            let amount = ''

            try {
                amount = parseCurrency(this.amount, this.decimals)
            }
            catch {}

            this.estimateDepositStEverAmount(amount).catch(logger.error)
        })
    }

    public get error(): string | null {
        const pattern = amountPattern(NATIVE_CURRENCY_DECIMALS)

        if (!this.amount) return 'required'
        if (!pattern.test(this.amount)) return 'pattern'
        if (!this.validateAmount(this.amount)) return 'invalidAmount'
        if (!this.validateBalance(this.amount)) return 'insufficientBalance'

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

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.selectedAccount.tonWallet.address]
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    public get walletInfo(): nt.TonWalletDetails {
        return this.nekoton.getContractTypeDefaultDetails(this.everWalletAsset.contractType)
    }

    public get balance(): BigNumber {
        return new BigNumber(this.everWalletState?.balance || '0')
    }

    public get maxAmount(): string {
        return this.balance
            .minus(STAKE_DEPOSIT_ATTACHED_AMOUNT)
            .minus(parseEvers('0.1')) // blockchain fee
            .toFixed()
    }

    public get decimals(): number {
        return NATIVE_CURRENCY_DECIMALS
    }

    public get currencyName(): string {
        return NATIVE_CURRENCY
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

            return current.isGreaterThanOrEqualTo(this.walletInfo.minAmount)
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
                this.depositStEverAmount = '0'
            })
            return
        }

        try {
            const amount = await this.stakeStore.getDepositStEverAmount(value)

            runInAction(() => {
                this.depositStEverAmount = amount
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}
