import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import type { ConnectionDataItem } from '@app/models'
import { convertCurrency, convertEvers } from '@app/shared'
import { AccountabilityStore, ConnectionStore, SlidingPanelHandle, TokensStore } from '@app/popup/modules/shared'

@injectable()
export class DeleteConfirmationViewModel {

    public address!: string

    constructor(
        public handle: SlidingPanelHandle,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList | undefined {
        return this.accountability.accountEntries[this.address]
    }

    public get balance(): string | undefined {
        if (!this.account) return undefined

        const { tokens, prices, everPrice } = this.tokensStore
        const { accountContractStates, tokenWalletStates } = this.accountability
        const balance = accountContractStates[this.account.tonWallet.address]?.balance

        if (!everPrice || !balance) return undefined

        const assets = this.account.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
        const assetsUsdtTotal = assets.reduce((sum, { rootTokenContract }) => {
            const token = tokens[rootTokenContract]
            const price = prices[rootTokenContract]
            const state = tokenWalletStates[rootTokenContract]

            if (token && price && state) {
                const usdt = new BigNumber(convertCurrency(state.balance, token.decimals)).times(price)
                return BigNumber.sum(usdt, sum)
            }

            return sum
        }, new BigNumber(convertEvers(balance)).times(everPrice))

        return assetsUsdtTotal.toFixed()
    }

    private get selectedConnection(): ConnectionDataItem {
        return this.connectionStore.selectedConnection
    }

}
