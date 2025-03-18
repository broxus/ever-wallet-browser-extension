import type * as nt from '@broxus/ever-wallet-wasm'
import { computed, makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import type { ConfirmMessageToPrepare, MessageAmount, SubmitTransaction, TokenWalletTransaction } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    Drawer,
    LocalizationStore,
    Logger,
    RpcStore,
    SelectableKeys,
    Token,
    TokensStore,
    Utils,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import {
    AggregatedMultisigTransactions,
    currentUtime,
    extractTransactionAddress,
    NATIVE_CURRENCY_DECIMALS,
} from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'

@injectable()
export class MultisigTransactionViewModel {

    public transaction!: (nt.TonWalletTransaction | TokenWalletTransaction) & SubmitTransaction

    public step = createEnumField<typeof Step>(Step.Preview)

    public parsedTokenTransaction: ParsedTokenTransaction | undefined

    public selectedKey: nt.KeyStoreEntry | undefined

    public loading = false

    public error = ''

    public fees = ''

    public txErrorsLoaded = false

    public txErrors: nt.TransactionTreeSimulationError[] = []

    constructor(
        public drawer: Drawer,
        public ledger: LedgerUtils,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private tokensStore: TokensStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, {
            custodians: computed.struct,
            accountUnconfirmedTransactions: computed.struct,
            accountMultisigTransactions: computed.struct,
        }, { autoBind: true })

        utils.when(() => !!this.transaction, async () => {
            this.setSelectedKey(this.filteredSelectableKeys[0])
            await this.getTokenRootDetailsFromTokenWallet(this.transaction)
        })
    }

    public get selectedAccount(): nt.AssetsList {
        return this.accountability.selectedAccount!
    }

    public get clockOffset(): number {
        return this.rpcStore.state.clockOffset
    }

    public get expirationTime(): number {
        const details = this.accountability.accountDetails[this.source] as nt.TonWalletDetails | undefined
        return details?.expirationTime ?? 3600
    }

    public get isExpired(): boolean {
        return this.transaction.createdAt + this.expirationTime <= currentUtime(this.clockOffset)
    }

    public get custodians(): string[] {
        return this.accountability.accountCustodians[this.source] ?? []
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys()
    }

    public get accountUnconfirmedTransactions() {
        return this.rpcStore.state.accountUnconfirmedTransactions
    }

    public get accountMultisigTransactions(): Record<string, AggregatedMultisigTransactions> {
        return this.rpcStore.state.accountMultisigTransactions
    }

    public get source(): string {
        return this.transaction.inMessage.dst!
    }

    public get value(): string {
        return this.transaction.info.data.method.data.data.value
    }

    public get transactionId(): string {
        return this.transaction.info.data.method.data.data.transactionId
    }

    public get creator(): string {
        return this.transaction.info.data.method.data.data.custodian
    }

    public get knownPayload() {
        return this.transaction.info.data.knownPayload
    }

    public get txHash(): string | undefined {
        return this.multisigTransaction?.finalTransactionHash
    }

    public get unconfirmedTransaction(): nt.MultisigPendingTransaction | undefined {
        if (!this.source) return undefined

        return this.accountUnconfirmedTransactions[this.source]?.[this.transactionId]
    }

    public get multisigTransaction() {
        if (!this.source) return undefined

        return this.accountMultisigTransactions[this.source]?.[this.transactionId]
    }

    public get confirmations(): Set<string> {
        return new Set(this.multisigTransaction?.confirmations ?? [])
    }

    public get filteredSelectableKeys(): nt.KeyStoreEntry[] {
        return this.selectableKeys.keys.filter(key => !this.confirmations.has(key.publicKey))
    }

    public get amount(): MessageAmount {
        return !this.parsedTokenTransaction
            ? { type: 'ever_wallet', data: { amount: this.value }}
            : {
                type: 'token_wallet',
                data: {
                    amount: this.parsedTokenTransaction.amount,
                    attachedAmount: this.value,
                    symbol: this.parsedTokenTransaction.symbol,
                    decimals: this.parsedTokenTransaction.decimals,
                    rootTokenContract: this.parsedTokenTransaction.rootTokenContract,
                    old: this.parsedTokenTransaction.old,
                },
            }
    }

    public get comment(): string | null {
        if (!this.parsedTokenTransaction) {
            const everTransaction = this.transaction as nt.TonWalletTransaction

            if (everTransaction.info?.type === 'comment') {
                return everTransaction.info?.data
            }
        }

        return null
    }

    public get context(): nt.LedgerSignatureContext | undefined {
        const account = this.accountability.accountEntries[this.source]

        if (!account) return undefined

        return this.ledger.prepareContext({
            type: 'confirm',
            everWallet: account.tonWallet,
            decimals: this.amount.type === 'ever_wallet' ? NATIVE_CURRENCY_DECIMALS : this.amount.data.decimals,
            asset: this.amount.type === 'ever_wallet' ? this.nativeCurrency : this.amount.data.symbol,
        })
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get tokens(): Record<string, Token | undefined> {
        return this.tokensStore.tokens
    }

    public async onConfirm(): Promise<void> {
        await this.estimateConfirmationFees()
        this.step.setValue(Step.EnterPassword)
        this.simulateTransactionTree().catch(this.logger.error)
    }

    public onBack(): void {
        this.fees = ''
        this.error = ''
        this.step.setValue(Step.Preview)
    }

    public async onSubmit(password: nt.KeyPassword): Promise<void> {
        const messageToPrepare: ConfirmMessageToPrepare = {
            publicKey: password.data.publicKey,
            transactionId: this.transactionId,
        }

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
            const signedMessage = await this.rpcStore.rpc.prepareConfirmMessage(
                this.source,
                messageToPrepare,
                password,
            )

            this.rpcStore.rpc.sendMessage(this.source, {
                signedMessage,
                info: {
                    type: 'confirm',
                    data: undefined,
                },
            }).catch(this.logger.error)

            this.drawer.close()
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

    public setSelectedKey(key: nt.KeyStoreEntry | undefined): void {
        this.selectedKey = key
    }

    private async estimateConfirmationFees() {
        if (!this.selectedKey) return

        runInAction(() => {
            this.fees = ''
        })

        try {
            const fees = await this.rpcStore.rpc.estimateConfirmationFees(this.source, {
                publicKey: this.selectedKey.publicKey,
                transactionId: this.transactionId,
            })

            runInAction(() => {
                this.fees = fees
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

    private async simulateTransactionTree() {
        if (!this.selectedKey) return

        runInAction(() => {
            this.txErrors = []
            this.txErrorsLoaded = false
        })

        try {
            const errors = await this.rpcStore.rpc.simulateConfirmationTransactionTree(this.source, {
                publicKey: this.selectedKey.publicKey,
                transactionId: this.transactionId,
            })

            runInAction(() => {
                this.txErrors = errors
            })
        }
        finally {
            runInAction(() => {
                this.txErrorsLoaded = true
            })
        }
    }

    private async getTokenRootDetailsFromTokenWallet(transaction: SubmitTransaction) {
        const { knownPayload } = transaction.info.data

        if (
            knownPayload?.type !== 'token_outgoing_transfer'
            && knownPayload?.type !== 'token_swap_back'
        ) {
            return
        }

        try {
            const recipient = extractTransactionAddress(transaction).address
            const details = await this.rpcStore.rpc.getTokenRootDetailsFromTokenWallet(recipient)

            runInAction(() => {
                this.parsedTokenTransaction = {
                    amount: knownPayload.data.tokens,
                    symbol: details.symbol,
                    decimals: details.decimals,
                    rootTokenContract: details.address,
                    old: details.version === 'OldTip3v4',
                }
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}

interface ParsedTokenTransaction {
    amount: string
    symbol: string
    decimals: number
    rootTokenContract: string
    old: boolean
}

export enum Step {
    Preview,
    EnterPassword,
}
