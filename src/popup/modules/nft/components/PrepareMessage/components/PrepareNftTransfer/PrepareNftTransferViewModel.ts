import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { ErrorOption } from 'react-hook-form'

import type { Nekoton, NftTransferToPrepare, TransferMessageToPrepare } from '@app/models'
import { AccountabilityStore, ConnectionStore, LocalizationStore, NekotonToken, Router, RpcStore } from '@app/popup/modules/shared'
import { isNativeAddress } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

import { MessageParams, NftTransferStore } from '../../../../store'

@injectable()
export class PrepareNftTransferViewModel {

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
            sendGasTo: this.everWalletAsset.address,
            callbacks: {
                [this.everWalletAsset.address]: { value: '100000000', payload: '' },
                [recipient]: { value: '100000000', payload: '' },
            },
        })

        const messageToPrepare: TransferMessageToPrepare = {
            publicKey: this.key.publicKey,
            recipient: internalMessage.destination,
            amount: internalMessage.amount,
            payload: internalMessage.body,
        }
        const messageParams: MessageParams = {
            recipient,
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
            && value !== this.account.tonWallet.address // can't send nft to myself
            && (this.nekoton.checkAddress(value) || !isNativeAddress(value))
    }

    private prepareTransfer(params: NftTransferToPrepare): Promise<nt.InternalMessage> {
        return this.rpcStore.rpc.prepareNftTransfer(this.transfer.nft.address, params)
    }

}

export interface FormData {
    recipient: string;
}
