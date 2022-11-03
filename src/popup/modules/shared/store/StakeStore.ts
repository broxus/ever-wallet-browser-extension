import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'

import { StEverVaultAbi } from '@app/abi'
import type {
    StEverVaultDetails,
    Nekoton,
    DepositParams,
    StakeBannerState,
    WithdrawRequest,
    NetworkGroup,
    RemovePendingWithdrawParams,
    TokenMessageToPrepare,
} from '@app/models'
import { Logger, ST_EVER_VAULT_ADDRESS_CONFIG, ST_EVER_TOKEN_ROOT_ADDRESS_CONFIG } from '@app/shared'

import { NekotonToken } from '../di-container'
import { RpcStore } from './RpcStore'

@singleton()
export class StakeStore {

    public details: StEverVaultDetails | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeAutoObservable<StakeStore, any>(this, {
            nekoton: false,
            rpcStore: false,
            logger: false,
        }, { autoBind: true })
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

    public get stakeBannerState(): StakeBannerState {
        return this.rpcStore.state.stakeBannerState
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    public async hideBanner(): Promise<void> {
        try {
            await this.rpcStore.rpc.setStakeBannerState('hidden')
        }
        catch (e) {
            this.logger.error(e)
        }
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

    public getStEverBalance(address: string): Promise<string> {
        return this.rpcStore.rpc.getStEverBalance(address)
    }

    public prepareStEverMessage(address: string, params: TokenMessageToPrepare): Promise<nt.InternalMessage> {
        return this.rpcStore.rpc.prepareStEverMessage(address, params)
    }

}
