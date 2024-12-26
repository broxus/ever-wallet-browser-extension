import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import { NATIVE_CURRENCY_DECIMALS } from '@app/shared'
import { parseError } from '@app/popup/utils'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { AccountabilityStore, ConnectionStore, LocalizationStore, Router, RpcStore, Token, TokensStore } from '@app/popup/modules/shared'
import { JettonSymbol } from '@app/models'

import { AssetTransferStore } from '../../store'

@injectable()
export class ConfirmationPageViewModel {

    public error = ''

    public loading = false

    constructor(
        public transfer: AssetTransferStore,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
        private ledger: LedgerUtils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.transfer.account.tonWallet.address]
    }

    public get context(): nt.LedgerSignatureContext | undefined {
        if (!this.transfer.key || !this.currencyName || typeof this.decimals === 'undefined') return undefined

        return this.ledger.prepareContext({
            type: 'transfer',
            everWallet: this.transfer.account.tonWallet,
            custodians: this.accountability.accountCustodians[this.transfer.account.tonWallet.address],
            key: this.transfer.key,
            decimals: this.decimals,
            asset: this.currencyName,
        })
    }

    public get balanceError(): string | undefined {
        const { fees, messageParams } = this.transfer

        if (!fees || !messageParams) return undefined

        const everBalance = new BigNumber(this.everWalletState?.balance || '0')
        let amount: BigNumber

        if (messageParams.amount.type === 'ever_wallet') {
            amount = new BigNumber(messageParams.amount.data.amount)
        }
        else {
            amount = new BigNumber(messageParams.amount.data.attachedAmount)
        }

        if (everBalance.isLessThan(amount.plus(fees))) {
            return this.localization.intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })
        }

        return undefined
    }

    private get knownTokens(): Record<string, nt.Symbol | JettonSymbol> {
        return this.rpcStore.state.knownTokens
    }

    private get symbol(): nt.Symbol | JettonSymbol | undefined {
        if (this.transfer.asset.type === 'ever_wallet') return undefined
        return this.knownTokens[this.transfer.asset.data.rootTokenContract]
    }

    private get token(): Token | undefined {
        if (this.transfer.asset.type === 'ever_wallet') return undefined
        return this.tokensStore.tokens[this.transfer.asset.data.rootTokenContract]
    }

    private get decimals(): number | undefined {
        return this.transfer.asset.type === 'token_wallet' ? this.symbol?.decimals : NATIVE_CURRENCY_DECIMALS
    }

    // TODO: refactor, asset -> currency info
    private get currencyName(): string | undefined {
        return this.transfer.asset.type === 'token_wallet'
            ? this.token?.symbol ?? this.symbol?.name
            : this.connectionStore.symbol
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
