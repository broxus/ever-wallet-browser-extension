import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { requiresSeparateDeploy, NetworkType } from '@app/shared'
import { AccountabilityStore, ConnectionStore, NekotonToken, SlidingPanelStore } from '@app/popup/modules/shared'
import { type Nekoton } from '@app/models'

@injectable()
export class AccountHeaderViewModel {

    public loading = false

    constructor(
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
        public connectionStore: ConnectionStore,
        @inject(NekotonToken) private nekoton: Nekoton,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get details(): nt.TonWalletDetails | undefined {
        return this.selectedAccountAddress
            ? this.accountability.accountDetails[this.selectedAccountAddress]
            : undefined
    }

    public get selectedCustodians(): string[] {
        return this.selectedAccountAddress
            ? this.accountability.accountCustodians[this.selectedAccountAddress] ?? []
            : []
    }

    public get selectedWalletInfo(): nt.TonWalletDetails | undefined {
        return this.selectedAccount
            ? this.nekoton.getContractTypeDefaultDetails(this.selectedAccount.tonWallet.contractType)
            : undefined
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public get isDeployed(): boolean {
        return this.everWalletState?.isDeployed
            || !requiresSeparateDeploy(
                this.selectedAccount?.tonWallet.contractType,
                this.connectionStore.connectionConfig,
            )
    }

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    public get selectedAccountAddress(): string | undefined {
        return this.accountability.selectedAccountAddress
    }

    public get selectedConnectionNetworkType(): NetworkType {
        return this.connectionStore.selectedConnectionNetworkType
    }

}
