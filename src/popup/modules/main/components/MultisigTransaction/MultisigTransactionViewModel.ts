import type nt from '@broxus/ever-wallet-wasm'
import { computed, makeAutoObservable, runInAction, when } from 'mobx'
import { Disposable, inject, injectable } from 'tsyringe'

import { ConfirmMessageToPrepare, MessageAmount, Nekoton, SubmitTransaction } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    Drawer,
    LocalizationStore,
    Logger,
    NekotonToken,
    RpcStore,
    SelectableKeys,
} from '@app/popup/modules/shared'
import { getScrollWidth, parseError } from '@app/popup/utils'
import { AggregatedMultisigTransactions, currentUtime, extractTransactionAddress, getAddressHash } from '@app/shared'

@injectable()
export class MultisigTransactionViewModel implements Disposable {

    public transaction!: (nt.TonWalletTransaction | nt.TokenWalletTransaction) & SubmitTransaction

    public step = createEnumField<typeof Step>(Step.Preview)

    public parsedTokenTransaction: ParsedTokenTransaction | undefined

    public selectedKey: nt.KeyStoreEntry | undefined

    public loading = false

    public error = ''

    public fees = ''

    private disposer: () => void

    constructor(
        public drawer: Drawer,
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, {
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

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
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

        this.step.setValue(Step.EnterPassword)
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

        if (password.type === 'ledger_key' && password.data.context) {
            password.data.context.address = getAddressHash(this.source)
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
