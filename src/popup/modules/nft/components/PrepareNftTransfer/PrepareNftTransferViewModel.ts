import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { Disposable, inject, injectable } from 'tsyringe'
import type { UseFormReturn } from 'react-hook-form'

import {
    ConnectionDataItem,
    MessageAmount,
    Nekoton,
    Nft,
    NftTransferToPrepare,
    TransferMessageToPrepare,
    WalletMessageToSend,
} from '@app/models'
import {
    AccountabilityStore,
    AppConfig,
    createEnumField,
    LocalizationStore,
    NekotonToken,
    RpcStore,
    SelectableKeys,
} from '@app/popup/modules/shared'
import { getScrollWidth, parseError } from '@app/popup/utils'
import {
    Logger,
    NATIVE_CURRENCY,
    NATIVE_CURRENCY_DECIMALS,
    closeCurrentWindow,
} from '@app/shared'

const DENS_REGEXP = /^(?:[\w\-@:%._+~#=]+\.)+\w+$/

@injectable()
export class PrepareNftTransferViewModel implements Disposable {

    public readonly selectedAccount: nt.AssetsList

    public step = createEnumField(Step, Step.EnterAddress)

    public nft!: Nft

    public form!: UseFormReturn<MessageFormData>

    public messageParams: MessageParams | undefined

    public messageToPrepare: TransferMessageToPrepare | undefined

    public selectedKey: nt.KeyStoreEntry | undefined = this.selectableKeys.keys[0]

    public loading = false

    public ledgerLoading = false

    public error = ''

    public fees = ''

    private ledgerCheckerDisposer: () => void

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private config: AppConfig,
        private logger: Logger,
    ) {
        makeAutoObservable<PrepareNftTransferViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
            localization: false,
            config: false,
            logger: false,
        }, { autoBind: true })

        this.selectedAccount = this.accountability.selectedAccount!

        this.ledgerCheckerDisposer = when(() => this.selectedKey?.signerName === 'ledger_key', async () => {
            try {
                runInAction(() => {
                    this.ledgerLoading = true
                })
                await this.rpcStore.rpc.getLedgerMasterKey()
            }
            catch (e) {
                this.step.setLedgerConnect()
            }
            finally {
                runInAction(() => {
                    this.ledgerLoading = false
                })
            }
        })
    }

    dispose(): Promise<void> | void {
        this.ledgerCheckerDisposer()
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
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

    public get balance(): Decimal {
        return new Decimal(this.everWalletState?.balance || '0')
    }

    public get decimals(): number {
        return NATIVE_CURRENCY_DECIMALS
    }

    public get currencyName(): string {
        return NATIVE_CURRENCY
    }

    public get balanceError(): string | undefined {
        if (!this.fees || !this.messageParams) return undefined

        const everBalance = new Decimal(this.everWalletState?.balance || '0')
        const fees = new Decimal(this.fees)
        const amount = new Decimal(this.messageParams.amount.data.amount)

        if (everBalance.lessThan(amount.add(fees))) {
            return this.localization.intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })
        }

        return undefined
    }

    public onChangeKeyEntry(value: nt.KeyStoreEntry): void {
        this.selectedKey = value

        if (this.messageParams) {
            this.submitMessageParams({
                recipient: this.messageParams.recipient,
            }).catch(this.logger.error)
        }
    }

    public async submitMessageParams(data: MessageFormData): Promise<void> {
        if (!this.selectedKey) {
            this.error = 'Signer key not selected'
            return
        }

        let recipient: string | null = data.recipient.trim()

        if (DENS_REGEXP.test(recipient)) {
            recipient = await this.rpcStore.rpc.resolveDensPath(recipient)

            if (!recipient) {
                this.form.setError('recipient', { type: 'invalid' })
                return
            }
        }

        const nftRecipient = this.nekoton.repackAddress(recipient)
        const internalMessage = await this.prepareTransfer({
            recipient: nftRecipient,
            sendGasTo: this.everWalletAsset.address,
            callbacks: {
                [this.everWalletAsset.address]: { value: '100000000', payload: '' },
                [nftRecipient]: { value: '100000000', payload: '' },
            },
        })

        const messageToPrepare: TransferMessageToPrepare = {
            publicKey: this.selectedKey.publicKey,
            recipient: internalMessage.destination,
            amount: internalMessage.amount,
            payload: internalMessage.body,
        }
        const messageParams: MessageParams = {
            amount: {
                type: 'ever_wallet',
                data: {
                    amount: internalMessage.amount,
                },
            },
            recipient: nftRecipient,
        }

        this.estimateFees(messageToPrepare)

        runInAction(() => {
            this.messageToPrepare = messageToPrepare
            this.messageParams = messageParams
            this.step.setEnterPassword()
        })
    }

    public async submitPassword(password: nt.KeyPassword): Promise<void> {
        if (!this.messageToPrepare || this.loading) {
            return
        }

        this.error = ''
        this.loading = true

        if (this.selectedKey?.signerName === 'ledger_key') {
            try {
                const masterKey = await this.rpcStore.rpc.getLedgerMasterKey()
                if (masterKey !== this.selectedKey.masterKey) {
                    runInAction(() => {
                        this.loading = false
                        this.error = this.localization.intl.formatMessage({ id: 'ERROR_LEDGER_KEY_NOT_FOUND' })
                    })
                    return
                }
            }
            catch {
                await this.rpcStore.rpc.openExtensionInExternalWindow({
                    group: 'ask_iframe',
                    width: 360 + getScrollWidth() - 1,
                    height: 600 + getScrollWidth() - 1,
                })
                window.close()
                return
            }
        }

        try {
            const { messageToPrepare } = this
            const signedMessage = await this.prepareMessage(messageToPrepare, password)

            await this.trySendMessage({
                signedMessage,
                info: {
                    type: 'transfer',
                    data: {
                        amount: messageToPrepare.amount,
                        recipient: messageToPrepare.recipient,
                    },
                },
            })
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
            && value !== this.selectedAccount.tonWallet.address // can't send nft to myself
            && (DENS_REGEXP.test(value) || this.nekoton.checkAddress(value))
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

    private prepareTransfer(params: NftTransferToPrepare): Promise<nt.InternalMessage> {
        return this.rpcStore.rpc.prepareNftTransfer(this.nft.address, params)
    }

    private sendMessage(message: WalletMessageToSend): Promise<void> {
        return this.rpcStore.rpc.sendMessage(this.everWalletAsset.address, message)
    }

    private async trySendMessage(message: WalletMessageToSend) {
        this.sendMessage(message).catch(this.logger.error)
        await closeCurrentWindow()
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
}

export interface MessageFormData {
    recipient: string;
}
