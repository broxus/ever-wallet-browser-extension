import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { Nekoton, NetworkGroup, Nft, PendingNft } from '@app/models'
import {
    AccountabilityStore,
    createEnumField,
    DrawerContext,
    LocalizationStore,
    NekotonToken,
    RpcStore,
} from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

import { NftStore } from '../../store'

@injectable()
export class NftImportViewModel {

    public drawer!: DrawerContext

    public tab = createEnumField(Tab, Tab.Manual)

    public checked = new Set<string>()

    public error = ''

    public initialized = true

    private loading = false

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private localization: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftImportViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
            nftStore: false,
            localization: false,
            logger: false,
        }, { autoBind: true })

        if (this.accountPendingNfts.length) {
            this.tab.setValue(Tab.Automatical)
            this.accountPendingNfts.forEach(({ address }) => this.checked.add(address))
            this.initialize().catch(this.logger.error)
        }
    }

    public get nfts(): Record<string, Nft> {
        return this.nftStore.nfts
    }

    public get accountPendingNfts(): PendingNft[] {
        const owner = this.accountability.selectedAccountAddress!
        return this.nftStore.accountPendingNfts[owner] ?? []
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    public validateAddress(value: string): boolean {
        return this.nekoton.checkAddress(value)
    }

    public updateChecked(address: string, checked: boolean): void {
        if (checked) {
            this.checked.add(address)
        }
        else {
            this.checked.delete(address)
        }
    }

    public async submitAutomatical(): Promise<void> {
        if (this.loading) return

        const owner = this.accountability.selectedAccountAddress!

        if (this.checked.size === 0) {
            await this.rpcStore.rpc.clearAccountPendingNfts(owner)
            this.drawer.close()
            return
        }

        this.loading = true
        this.error = ''

        try {
            const addresses = [
                ...this.accountPendingNfts.reduce((set, nft) => {
                    if (this.checked.has(nft.address)) {
                        set.add(nft.collection)
                    }
                    return set
                }, new Set<string>()),
            ]

            const collections = await this.nftStore.importNftCollections(owner, addresses)

            if (!collections) {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({
                        id: 'ERROR_NFT_IMPORT_ERROR',
                    })
                })
            }
            else {
                await this.rpcStore.rpc.clearAccountPendingNfts(owner)
                this.drawer.close()
            }
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

    public async submitManual(data: ImportFormData): Promise<void> {
        if (this.loading) return

        const { address } = data
        const owner = this.accountability.selectedAccountAddress!

        this.loading = true
        this.error = ''

        try {
            const collection = await this.nftStore.importNftCollection(owner, address)

            if (!collection) {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({
                        id: 'ERROR_NFT_NOT_FOUND',
                    })
                })
            }
            else {
                this.drawer.close()
            }
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

    private async initialize(): Promise<void> {
        this.initialized = false

        try {
            await this.nftStore.getNfts(
                this.accountPendingNfts.map(({ address }) => address),
            )
            await this.nftStore.getNftCollections(
                [...new Set(this.accountPendingNfts.map(({ collection }) => collection))],
            )
        }
        finally {
            runInAction(() => {
                this.initialized = true
            })
        }
    }

}

export enum Tab {
    Automatical,
    Manual,
}

export interface ImportFormData {
    address: string;
}
