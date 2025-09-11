import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'
import BigNumber from 'bignumber.js'

import { StEverVaultAbi } from '@app/abi'
import type { DepositParams, Nekoton, RemovePendingWithdrawParams, StEverVaultDetails, WithdrawRequest } from '@app/models'
import { NetworkGroup, Blockchain } from '@app/shared'

import { Logger } from '../utils'
import { NekotonToken } from '../di-container'
import { RpcStore } from './RpcStore'
import { ConnectionStore } from './ConnectionStore'
import { TokensStore } from './TokensStore'

@singleton()
export class StakeStore {

    public details: StEverVaultDetails | undefined

    private _apy: string | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private tokensStore: TokensStore,
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

    public get stakingInfo(): NonNullable<Blockchain['stakeInformation'] & {
        decimals: number,
        symbol: string
    }> {
        const group = this.rpcStore.state.selectedConnection.group

        const stakeInformation = this.connectionStore.connectionConfig?.blockchainsByGroup[group]?.stakeInformation
        const token = stakeInformation ? this.tokensStore.tokens[stakeInformation?.stakingRootContractAddress]
            : undefined

        const stakingInfo = stakeInformation ? {
            ...stakeInformation,
            decimals: token?.decimals,
            symbol: token?.symbol,
        } : {}

        return stakingInfo as NonNullable<Blockchain['stakeInformation'] & {
            decimals: number,
            symbol: string
        }>

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

    public async computeFees() {
        const info = this.stakingInfo
        if (!info) {
            return {
                depositAttachedFee: '0',
                removePendingWithdrawAttachedFee: '0',
                withdrawAttachedFee: '0',
            }
        }

        // if (networkType.isTycho) {
        const price = await this.rpcStore.rpc.getPrice()

        return {
            depositAttachedFee: await this.rpcStore.rpc.computeGas({
                dynamicGas: info.stakeDepositAttachedFee,
                params: price,
            }),
            removePendingWithdrawAttachedFee: await this.rpcStore.rpc.computeGas({
                dynamicGas: info.stakeRemovePendingWithdrawAttachedFee,
                params: price,
            }),
            withdrawAttachedFee: await this.rpcStore.rpc.computeGas({
                dynamicGas: info.stakeWithdrawAttachedFee,
                params: price,
            }),
        }


        // return {
        //     depositAttachedFee: info.stakeDepositAttachedFee,
        //     removePendingWithdrawAttachedFee: info.stakeRemovePendingWithdrawAttachedFee,
        //     withdrawAttachedFee: info.stakeWithdrawAttachedFee,
        // }
    }


    private async fetchInfo() {
        if (!this.stakingInfo.stakingAPYLink) return

        try {
            const response = await fetch(this.stakingInfo.stakingAPYLink)
            const info: StakingInfo = await response.json()

            runInAction(() => {
                this._apy = BigNumber(info.data.apy)
                    .multipliedBy(100)
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
