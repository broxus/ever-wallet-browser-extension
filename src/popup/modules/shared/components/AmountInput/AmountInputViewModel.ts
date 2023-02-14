import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import { ChangeEvent } from 'react'

import { NATIVE_CURRENCY_DECIMALS, TokenWalletState } from '@app/shared'

import { AccountabilityStore, ConnectionStore, RpcStore } from '../../store'

@injectable()
export class AmountInputViewModel {

    public account!: nt.AssetsList

    public asset!: string

    public search = ''

    public opened = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.account.tonWallet.address]
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.accountTokenStates?.[this.account.tonWallet.address] ?? {}
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | undefined {
        if (!this.asset) return undefined
        return this.knownTokens[this.asset]
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        const { group } = this.connectionStore.selectedConnection
        const tokenWallets = this.account.additionalAssets[group]?.tokenWallets ?? []

        if (!this.search) return tokenWallets

        const search = this.search.toLowerCase()
        return tokenWallets.filter(({ rootTokenContract }) => {
            const symbol = this.knownTokens[rootTokenContract]
            return symbol?.name.toLowerCase().includes(search)
                || symbol?.fullName.toLowerCase().includes(search)
        })
    }

    public get balance(): string {
        return this.asset
            ? this.tokenWalletStates[this.asset]?.balance || '0'
            : this.everWalletState?.balance || '0'
    }

    public get decimals(): number {
        return this.asset ? (this.symbol?.decimals ?? 0) : NATIVE_CURRENCY_DECIMALS
    }

    public get currencyName(): string | undefined {
        return this.asset ? this.symbol?.name : this.connectionStore.symbol
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public handleOpen(): void {
        this.opened = true
        this.search = ''
    }

    public handleClose(): void {
        this.opened = false
    }

    public handleSearchChange(e: ChangeEvent<HTMLInputElement>): void {
        this.search = e.target.value
    }

}
