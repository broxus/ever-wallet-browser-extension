import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, Logger, RpcStore } from '@app/popup/modules/shared'
import { Nft } from '@app/models'

import { NftStore } from '../../store'

@injectable()
export class TransferNftPageViewModel {

    public nft: Nft | undefined

    constructor(
        private rpcStore: RpcStore,
        private nftStore: NftStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        when(() => !!this.selectedAccount, () => this.getFromStorage())
    }

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public async getFromStorage(): Promise<void> {
        try {
            const address = await this.rpcStore.rpc.tempStorageRemove('selected_nft') as string
            const [nft] = await this.nftStore.getNfts([address])

            await this.nftStore.getNftCollections([nft.collection])

            runInAction(() => {
                this.nft = nft
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}
