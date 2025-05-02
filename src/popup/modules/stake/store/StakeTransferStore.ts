import type * as nt from '@broxus/ever-wallet-wasm'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, LocalizationStore, Logger, RpcStore, StakeStore, TransferStore, Utils } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { MessageAmount } from '@app/models'

type AdditionalKeys =
    | '_stEverBalance'
    | 'initialize'

@singleton()
export class StakeTransferStore extends TransferStore<MessageParams> {

    private _stEverBalance = '0'

    constructor(
        public ledger: LedgerUtils,
        private stakeStore: StakeStore,
        private connectionStore: ConnectionStore,
        rpcStore: RpcStore,
        accountability: AccountabilityStore,
        localization: LocalizationStore,
        logger: Logger,
        utils: Utils,
    ) {
        super(rpcStore, accountability, logger, ledger, utils, localization)
        makeObservable<StakeTransferStore, AdditionalKeys>(this, {
            _stEverBalance: observable,
            stEverBalance: computed,
            tokenWalletAssets: computed,
            initialize: action.bound,
        })

        utils.when(() => this.initialized, () => {
            this.stakeStore.getDetails().catch(this.logger.error)
            this.updateStEverBalance().catch(this.logger.error)
        })

        utils.interval(this.updateStEverBalance, 10_000)
    }

    public get stEverBalance(): string {
        return this._stEverBalance
    }

    public get stSymbol(): string {
        return this.stakeStore.stakingInfo.symbol
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        const { group } = this.connectionStore.selectedConnection
        return this.account.additionalAssets[group]?.tokenWallets ?? []
    }

    public async submitPassword(password: nt.KeyPassword): Promise<void> {
        await super.submitPassword(password)

        if (this.messageParams?.action === 'stake') {
            await this.updateTokenVisibility()
        }
    }

    protected initialize(account: nt.AssetsList): void {
        this._account = account
    }

    private async updateStEverBalance(): Promise<void> {
        if (!this._account) return

        try {
            const balance = await this.rpcStore.rpc.getTokenBalance(
                this._account.tonWallet.address,
                this.stakeStore.stakingInfo.stakingRootContractAddress,
            )
            runInAction(() => {
                this._stEverBalance = balance
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private async updateTokenVisibility(): Promise<void> {
        const { address } = this.account.tonWallet
        const stEverTokenRoot = this.stakeStore.stakingInfo.stakingRootContractAddress
        const hasStEverAsset = this.tokenWalletAssets
            .some(({ rootTokenContract }) => rootTokenContract === stEverTokenRoot)

        if (!hasStEverAsset) {
            await this.rpcStore.rpc.updateTokenWallets(address, {
                [stEverTokenRoot]: true,
            })
        }
    }

}

export interface MessageParams {
    amount: MessageAmount;
    originalAmount: string;
    action: 'stake' | 'unstake' | 'cancel';
}
