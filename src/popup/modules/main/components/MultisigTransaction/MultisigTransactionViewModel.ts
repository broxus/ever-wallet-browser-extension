import type nt from '@wallet/nekoton-wasm'
import {
    computed,
    makeAutoObservable,
    runInAction,
    when,
} from 'mobx'
import { inject, injectable } from 'tsyringe'

import {
    ConfirmMessageToPrepare,
    MessageAmount,
    Nekoton,
    SubmitTransaction,
} from '@app/models'
import {
    AccountabilityStore,
    createEnumField,
    DrawerContext,
    LocalizationStore,
    NekotonToken,
    RpcStore,
    SelectableKeys,
} from '@app/popup/modules/shared'
import { getScrollWidth, parseError } from '@app/popup/utils'
import {
    AggregatedMultisigTransactions,
    currentUtime,
    extractTransactionAddress,
    Logger,
} from '@app/shared'

@injectable()
export class MultisigTransactionViewModel {

    public transaction!: (nt.TonWalletTransaction | nt.TokenWalletTransaction) & SubmitTransaction

    public drawer!: DrawerContext

    public step = createEnumField(Step, Step.Preview)

    public parsedTokenTransaction: ParsedTokenTransaction | undefined

    public selectedKey: nt.KeyStoreEntry | undefined

    public loading = false

    public error = ''

    public fees = ''

    private disposer: () => void

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable<MultisigTransactionViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            logger: false,
            disposer: false,
            custodians: computed.struct,
            accountUnconfirmedTransactions: computed.struct,
            accountMultisigTransactions: computed.struct,
        }, { autoBind: true })

        this.disposer = when(() => !!this.transaction, async () => {
            this.setSelectedKey(this.filteredSelectableKeys[0])
            await this.getTokenRootDetailsFromTokenWallet(this.transaction)
        })
    }

    public dispose(): Promise<void> | void {
        this.disposer()
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get clockOffset(): number {
        return this.rpcStore.state.clockOffset
    }

    public get expirationTime(): number {
        const account = this.accountability.accountEntries[this.source] as nt.AssetsList | undefined
        return account ? this.nekoton.getContractTypeDetails(account.tonWallet.contractType).expirationTime : 3600
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

    public async onConfirm(): Promise<void> {
        this.fees = ''

        if (this.selectedKey != null) {
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

        this.step.setEnterPassword()
    }

    public onBack(): void {
        this.fees = ''
        this.error = ''
        this.step.setPreview()
    }

    public async onSubmit(keyPassword: nt.KeyPassword): Promise<void> {
        const messageToPrepare: ConfirmMessageToPrepare = {
            publicKey: keyPassword.data.publicKey,
            transactionId: this.transactionId,
        }

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
            const signedMessage = await this.rpcStore.rpc.prepareConfirmMessage(
                this.source,
                messageToPrepare,
                keyPassword,
            )

            this.rpcStore.rpc.sendMessage(this.source, {
                signedMessage,
                info: {
                    type: 'confirm',
                    data: undefined,
                },
            }).catch(this.logger.error)

            this.drawer.setPanel(undefined)
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
                    old: details.version !== 'Tip3',
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
