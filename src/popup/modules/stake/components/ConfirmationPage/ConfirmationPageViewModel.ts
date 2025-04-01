import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import { ST_EVER, ST_EVER_DECIMALS } from '@app/shared'
import { parseError } from '@app/popup/utils'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { AccountabilityStore, ConnectionStore, LocalizationStore, Router } from '@app/popup/modules/shared'

import { StakeTransferStore } from '../../store'

@injectable()
export class ConfirmationPageViewModel {

    public error = ''

    public loading = false

    constructor(
        public transfer: StakeTransferStore,
        private router: Router,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private ledger: LedgerUtils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.transfer.account.tonWallet.address]
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get context(): nt.LedgerSignatureContext | undefined {
        if (!this.transfer.key || !this.transfer.messageParams) return undefined

        return this.ledger.prepareContext({
            type: 'transfer',
            everWallet: this.transfer.account.tonWallet,
            custodians: this.accountability.accountCustodians[this.transfer.account.tonWallet.address] || [],
            key: this.transfer.key,
            decimals: this.transfer.messageParams.amount.type === 'ever_wallet' ? this.connectionStore.decimals : ST_EVER_DECIMALS,
            asset: this.transfer.messageParams.amount.type === 'ever_wallet' ? this.connectionStore.symbol : ST_EVER,
        })
    }

    public get balanceError(): string | undefined {
        if (!this.transfer.fees || !this.transfer.messageParams) return undefined

        const everBalance = new BigNumber(this.everWalletState?.balance || '0')
        const fees = new BigNumber(this.transfer.fees)
        let amount: BigNumber

        if (this.transfer.messageParams.amount.type === 'ever_wallet') {
            amount = new BigNumber(this.transfer.messageParams.amount.data.amount)
        }
        else {
            amount = new BigNumber(this.transfer.messageParams.amount.data.attachedAmount)
        }

        if (everBalance.isLessThan(amount.plus(fees))) {
            return this.localization.intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })
        }

        return undefined
    }

    public get balance(): BigNumber {
        return new BigNumber(this.everWalletState?.balance || '0')
    }

    public get decimals(): number {
        return this.connectionStore.decimals
    }

    public async submit(password: nt.KeyPassword): Promise<void> {
        if (this.loading) return

        this.error = ''
        this.loading = true

        try {
            await this.transfer.submitPassword(password)
            await this.router.navigate('/result')
        }
        catch (e: any) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
