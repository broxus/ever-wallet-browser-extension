import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { Disposable, injectable } from 'tsyringe'

import { NetworkGroup, NftCollection } from '@app/models'
import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

import { NftStore } from '../../store'

@injectable()
export class NftCollectionsViewModel implements Disposable {

    private loading = false

    private disposer: () => void

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftCollectionsViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            nftStore: false,
            logger: false,
            disposer: false,
        }, { autoBind: true })

        this.disposer = reaction(
            () => `${this.connectionGroup}_${this.accountability.selectedAccountAddress}`,
            async () => {
                await this.updateCollections()
            },
            { fireImmediately: true },
        )
    }

    public dispose(): Promise<void> | void {
        this.disposer()
    }

    public get accountCollections(): NftCollection[] {
        const owner = this.accountability.selectedAccountAddress!
        const collections = this.nftStore.accountNftCollections[owner] ?? []
        const visibility = this.nftCollectionsVisibility[owner]

        if (visibility) {
            return collections.filter(({ address }) => visibility[address] !== false)
        }

        return collections
    }

    public get pendingNftCount(): number {
        const owner = this.accountability.selectedAccountAddress!
        return this.nftStore.accountPendingNfts[owner]?.length ?? 0
    }

    private get nftCollectionsVisibility() {
        return this.rpcStore.state.nftCollectionsVisibility
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    private async updateCollections(): Promise<void> {
        if (!this.accountability.selectedAccountAddress) return

        this.loading = true

        try {
            const owner = this.accountability.selectedAccountAddress
            await this.nftStore.scanNftCollections(owner)
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
