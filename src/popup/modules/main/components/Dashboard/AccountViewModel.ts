import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import BigNumber from 'bignumber.js'

import { convertCurrency, convertEvers, supportedByLedger, TokenWalletState } from '@app/shared'
import { AccountabilityStore, ConnectionStore, TokensStore } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { ConnectionDataItem } from '@app/models'

@injectable()
export class AccountCardViewModel {

    public address!: string

    constructor(
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
        private contactsStore: ContactsStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList | undefined {
        return this.accountability.accountEntries[this.address]
    }

    public get key(): nt.KeyStoreEntry | undefined {
        return this.account ? this.accountability.storedKeys[this.account.tonWallet.publicKey] : undefined
    }

    public get canRemove(): boolean {
        return this.accountability.accounts.length > 1
    }

    public get canVerify(): boolean {
        return this.key?.signerName === 'ledger_key' && supportedByLedger(this.account?.tonWallet.contractType)
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.connectionStore.selectedConnection
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.accountability.accountContractStates
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.tokenWalletStates
    }

    public get details(): nt.TonWalletDetails | undefined {
        return this.account ? this.accountability.accountDetails[this.account.tonWallet.address] : undefined
    }

    public get custodians(): string[] {
        return this.account?.tonWallet !== undefined
            ? this.accountability.accountCustodians[this.account.tonWallet.address] ?? []
            : []
    }

    public get densPath(): string | undefined {
        return this.account ? this.contactsStore.densContacts[this.account.tonWallet.address]?.at(0)?.path : undefined
    }

    public get balance(): string | undefined {
        const { tokens, prices, everPrice } = this.tokensStore
        const balance = this.account ? this.accountContractStates[this.account.tonWallet.address]?.balance : undefined

        if (!everPrice || !balance) return undefined

        const assets = this.account ? this.account.additionalAssets[this.selectedConnection.group]?.tokenWallets : []
        const assetsUsdtTotal = assets.reduce((sum, { rootTokenContract }) => {
            const token = tokens[rootTokenContract]
            const price = prices[rootTokenContract]
            const state = this.tokenWalletStates[rootTokenContract]

            if (token && price && state) {
                const usdt = new BigNumber(convertCurrency(state.balance, token.decimals)).times(price)
                return BigNumber.sum(usdt, sum)
            }

            return sum
        }, new BigNumber(convertEvers(this.connectionStore.decimals, balance)).times(everPrice))

        return assetsUsdtTotal.toFixed()
    }

    public get nativeBalance(): string {
        return convertEvers(
            this.connectionStore.decimals,
            this.account ? this.accountContractStates[this.account.tonWallet.address]?.balance : '0',
        )
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

}
