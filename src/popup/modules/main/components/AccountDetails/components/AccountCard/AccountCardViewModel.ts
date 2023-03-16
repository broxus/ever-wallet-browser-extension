import type nt from '@broxus/ever-wallet-wasm'
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

    public get account(): nt.AssetsList {
        return this.accountability.accountEntries[this.address]
    }

    public get key(): nt.KeyStoreEntry {
        return this.accountability.storedKeys[this.account.tonWallet.publicKey]
    }

    public get canRemove(): boolean {
        return this.accountability.accounts.length > 1
    }

    public get canVerifyAddress(): boolean {
        return this.key?.signerName === 'ledger_key' && supportedByLedger(this.account.tonWallet.contractType)
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
        return this.accountability.accountDetails[this.account.tonWallet.address]
    }

    public get custodians(): string[] {
        return this.accountability.accountCustodians[this.account.tonWallet.address] ?? []
    }

    public get densPath(): string | undefined {
        return this.contactsStore.densContacts[this.account.tonWallet.address]?.at(0)?.path
    }

    public get balance(): string | undefined {
        const { meta, prices, everPrice } = this.tokensStore
        const balance = this.accountContractStates[this.account.tonWallet.address]?.balance

        if (!everPrice || !balance) return undefined

        const assets = this.account.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
        const assetsUsdtTotal = assets.reduce((sum, { rootTokenContract }) => {
            const token = meta[rootTokenContract]
            const price = prices[rootTokenContract]
            const state = this.tokenWalletStates[rootTokenContract]

            if (token && price && state) {
                const usdt = new BigNumber(convertCurrency(state.balance, token.decimals)).times(price)
                return BigNumber.sum(usdt, sum)
            }

            return sum
        }, new BigNumber(convertEvers(balance)).times(everPrice))

        return assetsUsdtTotal.toFixed()
    }

}
