import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { UseFormReturn } from 'react-hook-form'

import type {
    ConnectionDataItem, JettonSymbol,
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
    Token,
    TokensStore,
    Utils,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import {
    isNativeAddress, isTokenSymbol,
    MULTISIG_UNCONFIRMED_LIMIT,
    NATIVE_CURRENCY_DECIMALS,
    parseCurrency,
    parseEvers,
    SelectedAsset,
    TokenWalletState,
} from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { LedgerUtils } from '@app/popup/modules/ledger'

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

    public error = ''

    public fees = ''

    public txErrors: nt.TransactionTreeSimulationError[] = []

    public commentVisible = false

    constructor(
        public ledger: LedgerUtils,
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private contactsStore: ContactsStore,
        private tokensStore: TokensStore,
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

    set defaultAsset(value: SelectedAsset) {
        if (!value) return

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

    public get knownTokens(): Record<string, nt.Symbol | JettonSymbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | JettonSymbol | undefined {
        return this.knownTokens[this.selectedAsset]
    }

    public get token(): Token | undefined {
        return this.tokensStore.tokens[this.selectedAsset]
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
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

    public get balance(): BigNumber {
        return this.selectedAsset
            ? new BigNumber(this.tokenWalletStates[this.selectedAsset]?.balance || '0')
            : new BigNumber(this.everWalletState?.balance || '0')
    }

    public get decimals(): number | undefined {
        return this.selectedAsset ? this.symbol?.decimals : NATIVE_CURRENCY_DECIMALS
    }

    public get currencyName(): string | undefined {
        return this.selectedAsset
            ? this.token?.symbol ?? this.symbol?.name
            : this.connectionStore.symbol
    }

    public get old(): boolean {
        if (this.selectedAsset && isTokenSymbol(this.symbol)) {
            return this.symbol.version === 'OldTip3v4'
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

        return this.ledger.prepareContext({
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
            messageToPrepare: TransferMessageToPrepare

        const { address, densPath } = await this.contactsStore.resolveAddress(data.recipient.trim())

        if (!address) {
            this.form.setError('recipient', { type: 'invalid' })
            return
        }

        await this.contactsStore.addRecentContacts([{ type: 'address', value: densPath ?? address }])

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
        this.simulateTransactionTree(messageToPrepare) // TODO: refactor (already done in sparx)

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
            && (this.nekoton.checkAddress(value) || !isNativeAddress(value))
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

    public isDens(address: string | undefined): boolean {
        return !!address && !this.nekoton.checkAddress(address) && !isNativeAddress(address)
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

    private async simulateTransactionTree(params: TransferMessageToPrepare) {
        this.txErrors = []

        try {
            const errors = await this.rpcStore.rpc.simulateTransactionTree(this.everWalletAsset.address, params)

            runInAction(() => {
                this.txErrors = errors
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
        if (this.connectionStore.selectedConnectionNetworkType === 'ton') {
            return this.rpcStore.rpc.prepareJettonMessage(owner, rootTokenContract, params)
        }

        return this.rpcStore.rpc.prepareTokenMessage(owner, rootTokenContract, params)
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
