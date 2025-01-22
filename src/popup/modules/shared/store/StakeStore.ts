import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import BigNumber from 'bignumber.js'

import { StEverVaultAbi } from '@app/abi'
import type { DepositParams, Nekoton, NetworkGroup, RemovePendingWithdrawParams, StEverVaultDetails, WithdrawRequest } from '@app/models'
import { SAKING_INFO_URL, ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG, ST_EVER_VAULT_ADDRESS_CONFIG, STAKE_APY_PERCENT } from '@app/shared'

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
        return this._apy ?? STAKE_APY_PERCENT
    }

    public get withdrawRequests(): Record<string, Record<string, WithdrawRequest>> {
        return this.rpcStore.state.withdrawRequests
    }

    public get stEverVault(): string {
        return ST_EVER_VAULT_ADDRESS_CONFIG[this.connectionGroup]!
    }

    public get stEverTokenRoot(): string {
        return ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG[this.connectionGroup]!
    }

    public get stakingAvailable(): boolean {
        return !!this.stEverVault && !!this.stEverTokenRoot
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
        try {
            const response = await fetch(SAKING_INFO_URL)
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
