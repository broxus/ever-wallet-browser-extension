import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, when } from 'mobx'
import { injectable } from 'tsyringe'

import { Logger, SelectedAsset } from '@app/shared'
import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class SendPageViewModel {

    initialSelectedAsset: SelectedAsset | undefined

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable<SendPageViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
        })

        when(() => !!this.selectedAccount, () => this.getFromStorage())
    }

    get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    get tonWalletState(): nt.ContractState | undefined {
        return this.accountability.tonWalletState
    }

    getFromStorage = async () => {
        let value: SelectedAsset | null = null

        try {
            value = await this.rpcStore.rpc.tempStorageRemove('selected_asset') as SelectedAsset
        }
        catch (e) {
            this.logger.error(e)
        }

        this.setSelectedAsset(value ?? {
            type: 'ton_wallet',
            data: { address: this.selectedAccount!.tonWallet!.address },
        })
    }

    private setSelectedAsset(value: SelectedAsset) {
        this.initialSelectedAsset = value
    }

}
