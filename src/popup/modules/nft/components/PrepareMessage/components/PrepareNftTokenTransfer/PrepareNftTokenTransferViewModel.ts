import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { ErrorOption } from 'react-hook-form'

import type { Nekoton, TransferMessageToPrepare } from '@app/models'
import { NftTokenTransferToPrepare } from '@app/models'
import { AccountabilityStore, LocalizationStore, NekotonToken, Router, RpcStore } from '@app/popup/modules/shared'
import { isNativeAddress } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

import { MessageParams, NftTransferStore } from '../../../../store'

@injectable()
export class PrepareNftTokenTransferViewModel {

    public setFormError!: (field: keyof FormData, error: ErrorOption) => void

    public loading = false

    public error = ''

    constructor(
        public transfer: NftTransferStore,
        @inject(NekotonToken) private nekoton: Nekoton,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList {
        return this.transfer.account
    }

    public get key(): nt.KeyStoreEntry | undefined {
        return this.transfer.key
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.account.tonWallet.address]
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.account.tonWallet
    }

    public async submit(data: FormData): Promise<void> {
        if (!this.key) {
            this.error = this.localization.intl.formatMessage({
                id: 'ERROR_SIGNER_KEY_NOT_SELECTED',
            })
            return
        }

        const { address: recipient } = await this.contactsStore.resolveAddress(data.recipient.trim())

        if (!recipient) {
            this.setFormError('recipient', { type: 'invalid' })
            return
        }

        const internalMessage = await this.prepareTransfer({
            recipient,
            remainingGasTo: this.everWalletAsset.address,
            count: data.count,
        })

        const messageToPrepare: TransferMessageToPrepare = {
            publicKey: this.key.publicKey,
            params: [{ recipient: internalMessage.destination,
                amount: internalMessage.amount,
                payload: internalMessage.body,
                bounce: internalMessage.bounce }],
        }
        const messageParams: MessageParams = {
            recipient,
            count: data.count,
            amount: {
                type: 'ever_wallet',
                data: {
                    amount: internalMessage.amount,
                },
            },
        }

        this.transfer.submitMessageParams(messageParams, messageToPrepare)
        this.router.navigate('/confirm')
    }

    public validateAddress(value: string): boolean {
        return !!value
            && value !== this.account.tonWallet.address // can't send tokens to myself
            && (this.nekoton.checkAddress(value) || !isNativeAddress(value))
    }

    public validateAmount(value?: string): boolean {
        return !!value && BigNumber(value).gt(0)
    }

    public validateBalance(value: string): boolean {
        return !!value && BigNumber(value).lte(this.transfer.nft.balance!)
    }

    private prepareTransfer(params: NftTokenTransferToPrepare): Promise<nt.InternalMessage> {
        const { id, collection } = this.transfer.nft
        return this.rpcStore.rpc.prepareNftTokenTransfer(this.everWalletAsset.address, { id, collection }, params)
    }

}

export interface FormData {
    recipient: string;
    count: string;
}
