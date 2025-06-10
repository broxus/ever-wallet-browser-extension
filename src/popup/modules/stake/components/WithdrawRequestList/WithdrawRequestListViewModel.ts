import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { WithdrawRequest } from '@app/models'
import { Drawer, Panel, StakeStore } from '@app/popup/modules/shared'
import { ST_EVER_DECIMALS } from '@app/shared'

@injectable()
export class WithdrawRequestListViewModel {

    public selectedAccount!: nt.AssetsList

    public withdrawRequest: WithdrawRequest | undefined

    constructor(
        public drawer: Drawer,
        private stakeStore: StakeStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get withdrawRequests(): WithdrawRequest[] {
        const { address } = this.selectedAccount.tonWallet
        return Object.values(this.stakeStore.withdrawRequests[address] ?? {}) ?? []
    }

    public get currencyName(): string {
        return this.stakeStore.config!.tokenSymbol
    }

    public get decimals(): number {
        return ST_EVER_DECIMALS
    }

    public openInfo(value: WithdrawRequest): void {
        this.withdrawRequest = value
        this.drawer.setPanel(Panel.STAKE_WITHDRAW_INFO)
    }

}
