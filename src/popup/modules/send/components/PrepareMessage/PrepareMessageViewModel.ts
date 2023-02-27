import type nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { UseFormReturn } from 'react-hook-form'

import {
    ConnectionDataItem,
    MessageAmount,
    Nekoton,
    TokenMessageToPrepare,
    TransferMessageToPrepare,
    WalletMessageToSend,
} from '@app/models'
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
import { getScrollWidth, parseError, prepareLedgerSignatureContext } from '@app/popup/utils'
import {
    convertCurrency,
    isNativeAddress,
    MULTISIG_UNCONFIRMED_LIMIT,
    NATIVE_CURRENCY_DECIMALS,
    parseCurrency,
    parseEvers,
    SelectedAsset,
    TokenWalletState,
} from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

@injectable()
export class PrepareMessageViewModel {

    public onSend!: (params: MessageParams) => void

    public readonly selectedAccount: nt.AssetsList

    public step = createEnumField<typeof Step>(Step.EnterAddress)

    public messageParams: MessageParams | undefined

    public messageToPrepare: TransferMessageToPrepare | undefined

    public selectedKey: nt.KeyStoreEntry | undefined

    public selectedAsset!: string

    public form!: UseFormReturn<MessageFormData>

    public notifyReceiver = false

    public loading = false

    public ledgerLoading = false

    public error = ''

    public fees = ''

    public commentVisible = false

    private _defaultAsset: SelectedAsset | undefined


    constructor(
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
            try {
                runInAction(() => {
                    this.ledgerLoading = true
                })
                await this.rpcStore.rpc.getLedgerMasterKey()
            }
            catch (e) {
                this.step.setValue(Step.LedgerConnect)
            }
            finally {
                runInAction(() => {
                    this.ledgerLoading = false
                })
            }
        })

        utils.when(() => !!this.selectableKeys.keys[0], () => {
            this.selectedKey = this.selectableKeys.keys[0]
        })
    }

    public get defaultAsset(): SelectedAsset {
        return this._defaultAsset ?? {
            type: 'ever_wallet',
            data: {
                address: this.everWalletAsset.address,
            },
        }
    }

    set defaultAsset(value: SelectedAsset) {
        if (!value) return

        this._defaultAsset = value
        this.selectedAsset = value.type === 'ever_wallet' ? '' : value.data.rootTokenContract
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys(this.selectedAccount)
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.selectedAccount.tonWallet.address]
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.accountTokenStates?.[this.selectedAccount.tonWallet.address] ?? {}
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | undefined {
        return this.knownTokens[this.selectedAsset]
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.selectedAccount.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    public get accountDetails(): Record<string, nt.TonWalletDetails> {
        return this.accountability.accountDetails
    }

    public get walletInfo(): nt.TonWalletDetails {
        const { address, contractType } = this.everWalletAsset
        return this.accountDetails[address] ?? this.nekoton.getContractTypeDefaultDetails(contractType)
    }

    public get options(): Option[] {
        return [
            { value: '', label: this.connectionStore.symbol },
            ...this.tokenWalletAssets.map(({ rootTokenContract }) => ({
                value: rootTokenContract,
                label: this.knownTokens[rootTokenContract]?.name || 'Unknown',
            })),
        ]
    }

    public get defaultOption(): Option {
        let defaultOption = this.options[0]

        if (this.defaultAsset.type === 'token_wallet') {
            for (const option of this.options) {
                if (this.defaultAsset.data.rootTokenContract === option.value) {
                    defaultOption = option
                }
            }
        }

        return defaultOption
    }

    public get balance(): BigNumber {
        return this.selectedAsset
            ? new BigNumber(this.tokenWalletStates[this.selectedAsset]?.balance || '0')
            : new BigNumber(this.everWalletState?.balance || '0')
    }

    public get decimals(): number | undefined {
        return this.selectedAsset ? this.symbol?.decimals : NATIVE_CURRENCY_DECIMALS
    }

    public get formattedBalance(): string {
        if (typeof this.decimals === 'undefined') return ''

        return convertCurrency(this.balance.toString(), this.decimals)
    }

    public get currencyName(): string | undefined {
        return this.selectedAsset ? this.symbol?.name : this.connectionStore.symbol
    }

    public get old(): boolean {
        if (this.selectedAsset && this.symbol) {
            return this.symbol.version !== 'Tip3'
        }

        return false
    }

    public get balanceError(): string | undefined {
        if (!this.fees || !this.messageParams) return undefined

        const everBalance = new BigNumber(this.everWalletState?.balance || '0')
        const fees = new BigNumber(this.fees)
        let amount: BigNumber

        if (this.messageParams.amount.type === 'ever_wallet') {
            amount = new BigNumber(this.messageParams.amount.data.amount)
        }
        else {
            amount = new BigNumber(this.messageParams.amount.data.attachedAmount)
        }

        if (everBalance.isLessThan(amount.plus(fees))) {
            return this.localization.intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })
        }

        return undefined
    }

    public get accountUnconfirmedTransactions() {
        return this.rpcStore.state.accountUnconfirmedTransactions
    }

    public get isMultisigLimit(): boolean {
        const { requiredConfirmations } = this.walletInfo
        const { address } = this.everWalletAsset

        if (!requiredConfirmations || requiredConfirmations === 1) return false

        return Object.keys(
            this.accountUnconfirmedTransactions[address] ?? {},
        ).length >= MULTISIG_UNCONFIRMED_LIMIT
    }

    public get context(): nt.LedgerSignatureContext | undefined {
        if (!this.selectedKey || !this.currencyName || typeof this.decimals === 'undefined') return undefined

        return prepareLedgerSignatureContext(this.nekoton, {
            type: 'transfer',
            everWallet: this.selectedAccount.tonWallet,
            custodians: this.accountability.accountCustodians[this.selectedAccount.tonWallet.address],
            key: this.selectedKey,
            decimals: this.decimals,
            asset: this.currencyName,
        })
    }

    public setNotifyReceiver(value: boolean): void {
        this.notifyReceiver = value
    }

    public onChangeAsset(value: string): void {
        this.selectedAsset = value ?? this.selectedAsset
    }

    public onChangeKeyEntry(value: nt.KeyStoreEntry): void {
        this.selectedKey = value

        if (this.messageParams) {
            this.submitMessageParams({
                amount: this.messageParams.originalAmount,
                recipient: this.messageParams.recipient,
                comment: this.messageParams.comment,
            }).catch(this.logger.error)
        }
    }

    public openEnterAddress(): void {
        if (this.messageParams) {
            this.form.setValue('amount', this.messageParams.originalAmount)
            this.form.setValue('recipient', this.messageParams.recipient)
            this.form.setValue('comment', this.messageParams.comment)
        }

        this.step.setValue(Step.EnterAddress)
    }

    public async submitMessageParams(data: MessageFormData): Promise<void> {
        if (!this.selectedKey) {
            this.error = this.localization.intl.formatMessage({
                id: 'ERROR_SIGNER_KEY_NOT_SELECTED',
            })
            return
        }

        let messageParams: MessageParams,
            messageToPrepare: TransferMessageToPrepare,
            densPath: string | undefined,
            address: string | null = data.recipient.trim()

        if (!isNativeAddress(address)) {
            densPath = address
            address = await this.contactsStore.resolveDensPath(densPath)

            if (!address) {
                this.form.setError('recipient', { type: 'invalid' })
                return
            }
        }

        await this.contactsStore.addRecentContact(densPath ?? address)

        if (!this.selectedAsset) {
            messageToPrepare = {
                publicKey: this.selectedKey.publicKey,
                recipient: this.nekoton.repackAddress(address), // shouldn't throw exceptions due to higher level validation
                amount: parseEvers(data.amount.trim()),
                payload: data.comment ? this.nekoton.encodeComment(data.comment) : undefined,
            }
            messageParams = {
                amount: { type: 'ever_wallet', data: { amount: messageToPrepare.amount }},
                originalAmount: data.amount,
                recipient: densPath ?? address,
                comment: data.comment,
            }
        }
        else {
            if (typeof this.decimals !== 'number') {
                this.error = 'Invalid decimals'
                return
            }

            const tokenAmount = parseCurrency(data.amount.trim(), this.decimals)
            const tokenRecipient = this.nekoton.repackAddress(address)

            const internalMessage = await this.prepareTokenMessage(
                this.everWalletAsset.address,
                this.selectedAsset,
                {
                    amount: tokenAmount,
                    recipient: tokenRecipient,
                    payload: data.comment ? this.nekoton.encodeComment(data.comment) : undefined,
                    notifyReceiver: this.notifyReceiver,
                },
            )

            messageToPrepare = {
                publicKey: this.selectedKey.publicKey,
                recipient: internalMessage.destination,
                amount: internalMessage.amount,
                payload: internalMessage.body,
            }
            messageParams = {
                amount: {
                    type: 'token_wallet',
                    data: {
                        amount: tokenAmount,
                        attachedAmount: internalMessage.amount,
                        symbol: this.currencyName || '',
                        decimals: this.decimals,
                        rootTokenContract: this.selectedAsset,
                        old: this.old,
                    },
                },
                originalAmount: data.amount,
                recipient: densPath ?? address,
                comment: data.comment,
            }
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

            this.onSend(this.messageParams!)
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
            && (value !== this.selectedAccount.tonWallet.address || !this.selectedAsset) // can't send tokens to myself
            && (!isNativeAddress(value) || this.nekoton.checkAddress(value))
    }

    public validateAmount(value?: string): boolean {
        if (this.decimals == null) {
            return false
        }
        try {
            const current = new BigNumber(
                parseCurrency(value || '', this.decimals),
            )

            if (!this.selectedAsset) {
                return current.isGreaterThanOrEqualTo(this.walletInfo.minAmount)
            }

            return current.isGreaterThan(0)
        }
        catch (e: any) {
            return false
        }
    }

    public validateBalance(value?: string): boolean {
        if (this.decimals == null) {
            return false
        }
        try {
            const current = new BigNumber(
                parseCurrency(value || '', this.decimals),
            )
            return current.isLessThanOrEqualTo(this.balance)
        }
        catch (e: any) {
            return false
        }
    }

    public showComment(): void {
        this.commentVisible = true
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

    private prepareTokenMessage(
        owner: string,
        rootTokenContract: string,
        params: TokenMessageToPrepare,
    ): Promise<nt.InternalMessage> {
        return this.rpcStore.rpc.prepareTokenMessage(owner, rootTokenContract, params)
    }

    private sendMessage(message: WalletMessageToSend): Promise<void> {
        return this.rpcStore.rpc.sendMessage(this.everWalletAsset.address, message)
    }

}

interface Option {
    value: string;
    label: string;
}

export enum Step {
    EnterAddress,
    EnterPassword,
    LedgerConnect,
}

export interface MessageParams {
    amount: MessageAmount;
    originalAmount: string;
    recipient: string;
    comment?: string;
}

export interface MessageFormData {
    amount: string;
    comment?: string;
    recipient: string;
}
