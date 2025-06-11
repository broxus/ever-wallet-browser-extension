import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { action, makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { MessageAmount, type Nekoton, PendingApproval, TransferMessageToPrepare } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    LocalizationStore,
    Logger, NekotonToken,
    RpcStore,
    SelectableKeys,
    Utils,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { NATIVE_CURRENCY_DECIMALS, requiresSeparateDeploy } from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveSendMessageViewModel {

    public step = createEnumField<typeof Step>(Step.MessagePreview)

    public loading = false

    public error = ''

    public fees = ''

    public txErrorsLoaded = false

    public txErrors: nt.TransactionTreeSimulationError[] = []

    public selectedKey: nt.KeyStoreEntry | undefined

    public tokenTransaction: TokenTransaction | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        public ledger: LedgerUtils,
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.autorun(() => {
            if (!this.approval || !this.selectedKey || !this.accountAddress) return

            const {
                recipient,
                amount,
                payload,
                ignoredComputePhaseCodes,
                ignoredActionPhaseCodes,
            } = this.approval.requestData
            const messageToPrepare: TransferMessageToPrepare = {
                publicKey: this.selectedKey.publicKey,
                recipient,
                amount,
                payload: payload != null
                    ? nekoton.encodeInternalInput(payload.abi, payload.method, payload.params)
                    : undefined,
            }

            this.rpcStore.rpc
                .estimateFees(this.accountAddress, messageToPrepare, {})
                .then(action(fees => {
                    this.fees = fees
                }))
                .catch(this.logger.error)

            runInAction(() => {
                this.txErrorsLoaded = false
            })
            this.rpcStore.rpc
                .simulateTransactionTree(
                    this.accountAddress,
                    messageToPrepare,
                    { ignoredComputePhaseCodes, ignoredActionPhaseCodes },
                )
                .then(action(errors => {
                    this.txErrors = errors
                }))
                .catch(this.logger.error)
                .finally(action(() => {
                    this.txErrorsLoaded = true
                }))
        })

        utils.autorun(() => {
            if (!this.approval) return

            const { recipient, knownPayload } = this.approval.requestData

            if (
                knownPayload?.type !== 'token_outgoing_transfer'
                && knownPayload?.type !== 'token_swap_back'
            ) return

            this.rpcStore.rpc
                .getTokenRootDetailsFromTokenWallet(recipient)
                .then(action(details => {
                    this.tokenTransaction = {
                        amount: knownPayload.data.tokens,
                        symbol: details.symbol,
                        decimals: details.decimals,
                        rootTokenContract: details.address,
                        old: details.version === 'OldTip3v4',
                    }
                }))
                .catch(this.logger.error)
        })

        utils.autorun(() => {
            if (!this.accountAddress) return
            this.rpcStore.rpc.updateContractState([this.accountAddress]).catch(this.logger.error)
        })

        utils.when(() => this.selectedKey?.signerName === 'ledger_key', async () => {
            const connected = await ledger.checkLedger()
            if (!connected) {
                this.step.setValue(Step.LedgerConnect)
            }
        })

        utils.when(() => !!this.selectableKeys?.keys[0], () => {
            this.selectedKey = this.selectableKeys?.keys[0]
        })
    }

    public get approval(): PendingApproval<'sendMessage'> {
        return this.approvalStore.approval as PendingApproval<'sendMessage'>
    }

    public get networkName(): string {
        return this.rpcStore.state.selectedConnection.name
    }

    public get account(): nt.AssetsList | undefined {
        if (!this.approval) return undefined
        return this.accountability.accountEntries[this.approval.requestData.sender]
    }

    public get accountAddress(): string | undefined {
        return this.account?.tonWallet.address
    }

    public get selectableKeys(): SelectableKeys | undefined {
        if (!this.account) return undefined

        return this.accountability.getSelectableKeys(this.account)
    }

    public get contractState(): nt.ContractState | undefined {
        if (!this.accountAddress) return undefined
        return this.accountability.accountContractStates[this.accountAddress]
    }

    public get balance(): BigNumber {
        return new BigNumber(this.contractState?.balance ?? '0')
    }

    public get isInsufficientBalance(): boolean {
        return this.balance.isLessThan(this.approval.requestData.amount)
    }

    public get isDeployed(): boolean {
        return !!this.account
            && (this.contractState?.isDeployed || !requiresSeparateDeploy(this.account.tonWallet.contractType))
    }

    public get messageAmount(): MessageAmount {
        return !this.tokenTransaction
            ? { type: 'ever_wallet', data: { amount: this.approval.requestData.amount }}
            : {
                type: 'token_wallet',
                data: {
                    amount: this.tokenTransaction.amount,
                    attachedAmount: this.approval.requestData.amount,
                    symbol: this.tokenTransaction.symbol,
                    decimals: this.tokenTransaction.decimals,
                    rootTokenContract: this.tokenTransaction.rootTokenContract,
                    old: this.tokenTransaction.old,
                },
            }
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get context(): nt.LedgerSignatureContext | undefined {
        if (!this.account || !this.selectedKey) return undefined

        return this.ledger.prepareContext({
            type: 'transfer',
            everWallet: this.account.tonWallet,
            custodians: this.accountability.accountCustodians[this.account.tonWallet.address],
            key: this.selectedKey,
            decimals: this.messageAmount.type === 'ever_wallet' ? NATIVE_CURRENCY_DECIMALS : this.messageAmount.data.decimals,
            asset: this.messageAmount.type === 'ever_wallet' ? this.nativeCurrency : this.messageAmount.data.symbol,
        })
    }

    public setKey(key: nt.KeyStoreEntry | undefined): void {
        this.selectedKey = key
    }

    public async onReject(): Promise<void> {
        this.loading = true
        await this.approvalStore.rejectPendingApproval()
    }

    public async onSubmit(password: nt.KeyPassword): Promise<void> {
        if (this.loading) return

        this.loading = true

        try {
            const isValid = await this.utils.checkPassword(password)

            if (isValid) {
                await this.approvalStore.resolvePendingApproval(password, true)
            }
            else {
                this.setError(this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' }))
            }
        }
        catch (e: any) {
            this.setError(parseError(e))
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async handleLedgerFailed(): Promise<void> {
        await this.approvalStore.rejectPendingApproval()
    }

    private setError(error: string): void {
        this.error = error
    }

}

export enum Step {
    MessagePreview,
    EnterPassword,
    LedgerConnect,
}

interface TokenTransaction {
    amount: string
    symbol: string
    decimals: number
    rootTokenContract: string
    old: boolean
}
