import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'
import type { UseFormReturn } from 'react-hook-form'

import type {
    ConnectionDataItem,
    MessageAmount,
    Nekoton,
    Nft,
    TransferMessageToPrepare,
    WalletMessageToSend,
} from '@app/models'
import { NftTokenTransferToPrepare } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    LocalizationStore,
    Logger,
    NekotonToken,
    RpcStore,
    SelectableKeys,
    Utils,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { closeCurrentWindow, isNativeAddress, NATIVE_CURRENCY_DECIMALS } from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { ContactsStore } from '@app/popup/modules/contacts'

@injectable()
export class PrepareNftTokenTransferViewModel {

    public readonly selectedAccount: nt.AssetsList

    public step = createEnumField<typeof Step>(Step.EnterAddress)

    public nft!: Nft

    public form!: UseFormReturn<FormData>

    public messageParams: MessageParams | undefined

    public messageToPrepare: TransferMessageToPrepare | undefined

    public selectedKey: nt.KeyStoreEntry | undefined

    public loading = false

    public error = ''

    public fees = ''

    constructor(
        public ledger: LedgerUtils,
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private contactsStore: ContactsStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.selectedAccount = this.accountability.selectedAccount!

        utils.when(() => this.selectedKey?.signerName === 'ledger_key', async () => {
            const connected = await ledger.checkLedger()
            if (!connected) {
                this.step.setValue(Step.LedgerConnect)
            }
        })

        utils.when(() => !!this.selectableKeys.keys[0], () => {
            this.selectedKey = this.selectableKeys.keys[0]
        })
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys(this.selectedAccount)
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.selectedAccount.tonWallet.address]
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    public get balance(): BigNumber {
        return new BigNumber(this.everWalletState?.balance || '0')
    }

    public get decimals(): number {
        return NATIVE_CURRENCY_DECIMALS
    }

    public get balanceError(): string | undefined {
        if (!this.fees || !this.messageParams) return undefined

        const everBalance = new BigNumber(this.everWalletState?.balance || '0')
        const fees = new BigNumber(this.fees)
        const amount = new BigNumber(this.messageParams.amount.data.amount)

        if (everBalance.isLessThan(amount.plus(fees))) {
            return this.localization.intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })
        }

        return undefined
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get context(): nt.LedgerSignatureContext | undefined {
        if (!this.selectedKey) return undefined

        return this.ledger.prepareContext({
            type: 'transfer',
            everWallet: this.selectedAccount.tonWallet,
            custodians: this.accountability.accountCustodians[this.selectedAccount.tonWallet.address],
            key: this.selectedKey,
            decimals: NATIVE_CURRENCY_DECIMALS,
            asset: this.nativeCurrency,
        })
    }

    public onChangeKeyEntry(value: nt.KeyStoreEntry): void {
        this.selectedKey = value

        if (this.messageParams) {
            this.submitMessageParams({
                recipient: this.messageParams.recipient,
                count: this.messageParams.count,
            }).catch(this.logger.error)
        }
    }

    public async submitMessageParams(data: FormData): Promise<void> {
        if (!this.selectedKey) {
            this.error = this.localization.intl.formatMessage({
                id: 'ERROR_SIGNER_KEY_NOT_SELECTED',
            })
            return
        }

        const { address: recipient } = await this.contactsStore.resolveAddress(data.recipient.trim())

        if (!recipient) {
            this.form.setError('recipient', { type: 'invalid' })
            return
        }

        const internalMessage = await this.prepareTransfer({
            recipient,
            remainingGasTo: this.everWalletAsset.address,
            count: data.count,
        })

        const messageToPrepare: TransferMessageToPrepare = {
            publicKey: this.selectedKey.publicKey,
            recipient: internalMessage.destination,
            amount: internalMessage.amount,
            payload: internalMessage.body,
            bounce: internalMessage.bounce,
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

        this.estimateFees(messageToPrepare)

        runInAction(() => {
            this.messageToPrepare = messageToPrepare
            this.messageParams = messageParams
            this.step.setValue(Step.EnterPassword)
        })
    }

    public async submitPassword(password: nt.KeyPassword): Promise<void> {
        if (!this.messageToPrepare || this.loading) {
            return
        }

        this.error = ''
        this.loading = true

        if (this.selectedKey?.signerName === 'ledger_key') {
            const found = await this.ledger.checkLedgerMasterKey(this.selectedKey)
            if (!found) {
                runInAction(() => {
                    this.loading = false
                    this.error = this.localization.intl.formatMessage({ id: 'ERROR_LEDGER_KEY_NOT_FOUND' })
                })
                return
            }
        }

        try {
            // TODO: refactor
            const { messageToPrepare } = this
            const signedMessage = await this.prepareMessage(messageToPrepare, password)

            await this.sendMessage({
                signedMessage,
                info: {
                    type: 'transfer',
                    data: {
                        amount: messageToPrepare.amount,
                        recipient: messageToPrepare.recipient,
                    },
                },
            })

            await closeCurrentWindow()
        }
        catch (e: any) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public validateAddress(value: string): boolean {
        return !!value
            && value !== this.selectedAccount.tonWallet.address // can't send tokens to myself
            && (this.nekoton.checkAddress(value) || !isNativeAddress(value))
    }

    public validateAmount(value?: string): boolean {
        return !!value && BigNumber(value).gt(0)
    }

    public validateBalance(value: string): boolean {
        return !!value && BigNumber(value).lte(this.nft.balance!)
    }

    private async estimateFees(params: TransferMessageToPrepare) {
        this.fees = ''

        try {
            const fees = await this.rpcStore.rpc.estimateFees(this.everWalletAsset.address, params, {})

            runInAction(() => {
                this.fees = fees
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private prepareMessage(
        params: TransferMessageToPrepare,
        password: nt.KeyPassword,
    ): Promise<nt.SignedMessage> {
        return this.rpcStore.rpc.prepareTransferMessage(this.everWalletAsset.address, params, password)
    }

    private prepareTransfer(params: NftTokenTransferToPrepare): Promise<nt.InternalMessage> {
        const { id, collection } = this.nft
        return this.rpcStore.rpc.prepareNftTokenTransfer(this.everWalletAsset.address, { id, collection }, params)
    }

    private sendMessage(message: WalletMessageToSend): Promise<void> {
        return this.rpcStore.rpc.sendMessage(this.everWalletAsset.address, message)
    }

}

export enum Step {
    EnterAddress,
    EnterPassword,
    LedgerConnect,
}

export interface MessageParams {
    amount: Extract<MessageAmount, { type: 'ever_wallet' }>;
    recipient: string;
    count: string;
}

export interface FormData {
    recipient: string;
    count: string;
}
