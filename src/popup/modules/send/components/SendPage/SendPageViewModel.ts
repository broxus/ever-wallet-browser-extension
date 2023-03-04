import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { SelectedAsset } from '@app/shared'
import { AccountabilityStore, Logger, RpcStore, Utils } from '@app/popup/modules/shared'

import { MessageParams } from '../PrepareMessage'

@injectable()
export class SendPageViewModel {

    public initialSelectedAsset: SelectedAsset | undefined

    public initialSelectedAddress: string | undefined

    public messageParams: MessageParams | undefined

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.when(() => !!this.selectedAccount, () => this.getFromStorage())
    }

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public async getFromStorage(): Promise<void> {
        let asset: SelectedAsset | null = null,
            address: string | null = null

        try {
            asset = await this.rpcStore.rpc.tempStorageRemove('selected_asset') as SelectedAsset
            address = await this.rpcStore.rpc.tempStorageRemove('selected_address') as string
        }
        catch (e) {
            this.logger.error(e)
        }

        runInAction(() => {
            this.initialSelectedAsset = asset ?? {
                type: 'ever_wallet',
                data: { address: this.selectedAccount!.tonWallet!.address },
            }
            this.initialSelectedAddress = address ?? ''
        })
    }

    public handleSend(params: MessageParams): void {
        this.messageParams = params
    }

}
