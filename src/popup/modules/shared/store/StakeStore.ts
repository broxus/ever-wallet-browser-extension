import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import BigNumber from 'bignumber.js'

import { StEverVaultAbi } from '@app/abi'
import type { DepositParams, Nekoton, RemovePendingWithdrawParams, StEverVaultDetails, WithdrawRequest } from '@app/models'
import { NetworkGroup, Blockchain } from '@app/shared'

import { Logger } from '../utils'
import { NekotonToken } from '../di-container'
import { RpcStore } from './RpcStore'

@singleton()
export class StakeStore {

    public details: StEverVaultDetails | undefined

    private _apy: string | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
        this.fetchInfo()
    }

    public get apy(): string {
        return this._apy ?? '0'
    }

    public get withdrawRequests(): Record<string, Record<string, WithdrawRequest>> {
        return this.rpcStore.state.withdrawRequests
    }

    public get stakingInfo(): NonNullable<Blockchain['stakeInformation']> {
        const network = this.rpcStore.state.selectedConnection.network
        return this.rpcStore.state.connectionConfig.blockchainsByNetwork[network].stakeInformation! || {}
    }

    public get stakingAvailable(): boolean {
        return !!Object.values(this.stakingInfo).length
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

    private async fetchInfo() {
        if (!this.stakingInfo.stakingAPYLink) return

        try {
            const response = await fetch(this.stakingInfo.stakingAPYLink)
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
