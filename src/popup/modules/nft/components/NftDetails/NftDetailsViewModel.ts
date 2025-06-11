import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'
import browser from 'webextension-polyfill'

import { EVERNAME_ADDRESS } from '@app/shared'
import { Nft, NftCollection } from '@app/models'
import { AccountabilityStore, ConnectionStore, LocalizationStore, NotificationStore, Router, RpcStore, Utils } from '@app/popup/modules/shared'
import { getScrollWidth } from '@app/popup/utils'

import { NftStore } from '../../store'

@injectable()
export class NftDetailsViewModel {

    public address!: string

    constructor(
        public notification: NotificationStore,
        private rpcStore: RpcStore,
        private connectionStore: ConnectionStore,
        private nftStore: NftStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private router: Router,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.address = this.router.state.matches.at(-1)?.params?.address as string

        utils.when(
            () => !!this.address && !!this.accountability.selectedAccountAddress,
            () => {
                const owner = this.accountability.selectedAccountAddress!
                this.nftStore.getNft(owner, this.address)
            },
        )

        utils.register(
            rpcStore.addEventListener(async ({ type, data }) => {
                if (type === 'ntf-transfer') {
                    if (this.nft) {
                        const { id, collection } = this.nft
                        const isSelectedNft = data.some(
                            (transfer) => transfer.id === id && transfer.collection === collection,
                        )

                        if (isSelectedNft) {
                            this.router.navigate(-1)
                        }
                    }
                }

                if (type === 'ntf-token-transfer') {
                    const accountAddress = this.accountability.selectedAccountAddress
                    const current = data.filter((transfer) => {
                        if (transfer.collection === this.collection?.address) {
                            if (transfer.type === 'out' && transfer.sender === accountAddress) return true
                            if (transfer.type === 'in' && transfer.recipient === accountAddress) return true
                        }
                        return false
                    })

                    if (this.nft) {
                        const { id, collection } = this.nft
                        const isSelectedNft = current.some(
                            (transfer) => transfer.id === id && transfer.collection === collection,
                        )

                        if (isSelectedNft) {
                            this.router.navigate(-1)
                        }
                    }
                }
            }),
        )
    }

    public get nft(): Nft | undefined {
        return this.nftStore.nfts[this.address]
    }

    public get isOwner(): boolean {
        return this.nft?.owner === this.accountability.selectedAccountAddress
    }

    public get canTransfer(): boolean {
        return this.nft?.owner === this.nft?.manager
    }

    public get collection(): NftCollection | undefined {
        return this.nftStore.collections[this.nft?.collection ?? '']
    }

    public get isEvername(): boolean {
        return this.collection?.address === EVERNAME_ADDRESS
    }

    public get marketplaceUrl(): string | undefined {
        return this.nftStore.marketplaceUrl
    }

    public getExplorerLink(address: string): string {
        return this.connectionStore.accountExplorerLink(address)
    }

    public async onTransfer(): Promise<void> {
        await this.rpcStore.rpc.tempStorageInsert('selected_nft', this.nft?.address)
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'transfer_nft',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async onTransferTokens(): Promise<void> {
        await this.rpcStore.rpc.tempStorageInsert('selected_nft', this.nft?.address)
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'transfer_nft_token',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    public async openMarketplace(): Promise<void> {
        await browser.tabs.create({
            url: `${this.nftStore.marketplaceUrl}/nft/${this.nft?.address}`,
            active: false,
        })
    }

    public showTransferError(): void {
        this.notification.error(
            this.localization.intl.formatMessage({ id: 'NFT_DETAILS_HINT' }),
        )
    }

}
