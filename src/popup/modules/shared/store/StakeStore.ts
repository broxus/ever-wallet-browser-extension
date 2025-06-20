import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import BigNumber from 'bignumber.js'

import { StEverVaultAbi } from '@app/abi'
import type { DepositParams, Nekoton, NetworkGroup, RemovePendingWithdrawParams, StakingConfig, StakingPrices, StEverVaultDetails, WithdrawRequest } from '@app/models'
import { STAKE_APY_PERCENT, STAKING_CONFIG } from '@app/shared'

import { Logger, Utils } from '../utils'
import { NekotonToken } from '../di-container'
import { RpcStore } from './RpcStore'

@singleton()
export class StakeStore {

    public details: StEverVaultDetails | undefined

    public prices: StakingPrices | null = null

    private _apy: string | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private utils: Utils,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get apy(): string {
        return this._apy ?? STAKE_APY_PERCENT
    }

    public get config(): StakingConfig | undefined {
        return STAKING_CONFIG[this.connectionGroup]
    }

    public get withdrawRequests(): Record<string, Record<string, WithdrawRequest>> {
        return this.rpcStore.state.withdrawRequests
    }

    public get stEverVault(): string | undefined {
        return this.config?.vaultAddress
    }

    public get stEverTokenRoot(): string | undefined {
        return this.config?.tokenRootAddress
    }

    public get stakingAvailable(): boolean {
        return !!this.config
    }

    public get withdrawTimeHours(): number {
        let withdrawHoldTime = new BigNumber(this.details?.withdrawHoldTime ?? 0)

        if (withdrawHoldTime.lte(24 * 60 * 60)) { // withdrawHoldTime <= 24h
            withdrawHoldTime = withdrawHoldTime.plus(36 * 60 * 60) // + 36h
        }
        else {
            withdrawHoldTime = withdrawHoldTime.plus(18 * 60 * 60) // + 18h
        }

        return withdrawHoldTime
            .div(60 * 60) // seconds to hours
            .dp(0, BigNumber.ROUND_CEIL)
            .toNumber()
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    public async getDetails(): Promise<void> {
        try {
            const details = await this.rpcStore.rpc.getStakeDetails()

            runInAction(() => {
                this.details = details
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    public async getPrices(): Promise<void> {
        try {
            const prices = await this.rpcStore.rpc.getStakePrices()

            runInAction(() => {
                this.prices = prices
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    public getDepositStEverAmount(evers: string): Promise<string> {
        return this.rpcStore.rpc.getDepositStEverAmount(evers)
    }

    public getWithdrawEverAmount(stevers: string): Promise<string> {
        return this.rpcStore.rpc.getWithdrawEverAmount(stevers)
    }

    public getDepositMessagePayload(amount: string): string {
        const abi = JSON.stringify(StEverVaultAbi)
        const params: DepositParams = {
            _amount: amount,
            _nonce: Date.now().toString(),
        }

        return this.nekoton.encodeInternalInput(abi, 'deposit', params)
    }

    public getRemovePendingWithdrawPayload(nonce: string): string {
        const abi = JSON.stringify(StEverVaultAbi)
        const params: RemovePendingWithdrawParams = {
            _nonce: nonce,
        }

        return this.nekoton.encodeInternalInput(abi, 'removePendingWithdraw', params)
    }

    public encodeDepositPayload(): Promise<string> {
        return this.rpcStore.rpc.encodeDepositPayload()
    }

    public async fetchInfo() {
        try {
            const url = this.config?.apiUrl
            if (!url) return

            const response = await fetch(url)
            const info: StakingInfo = await response.json()

            runInAction(() => {
                this._apy = BigNumber(info.data.apy)
                    .multipliedBy(100)
                    .dp(2)
                    .toFixed()
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}

interface StakingInfo {
    data: {
        apy: string;
    };
}
