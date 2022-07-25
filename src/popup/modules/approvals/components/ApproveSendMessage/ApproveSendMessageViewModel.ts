import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import {
    action, autorun, makeAutoObservable, runInAction,
} from 'mobx'
import { Disposable, inject, injectable } from 'tsyringe'

import {
    MessageAmount, Nekoton, PendingApproval, TransferMessageToPrepare,
} from '@app/models'
import {
    AccountabilityStore,
    createEnumField,
    LocalizationStore,
    NekotonToken,
    RpcStore,
    SelectableKeys,
} from '@app/popup/modules/shared'
import { ignoreCheckPassword, parseError } from '@app/popup/utils'
import { Logger } from '@app/shared'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveSendMessageViewModel implements Disposable {

    public step = createEnumField(Step, Step.MessagePreview)

    public loading = false

    public error = ''

    public fees = ''

    public selectedKey: nt.KeyStoreEntry | undefined = this.selectableKeys?.keys[0]

    public tokenTransaction: TokenTransaction | undefined

    private estimateFeesDisposer: () => void

    private getTokenRootDetailsDisposer: () => void

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private logger: Logger,
    ) {
        makeAutoObservable<ApproveSendMessageViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            approvalStore: false,
            accountability: false,
            localization: false,
            logger: false,
        }, { autoBind: true })

        this.estimateFeesDisposer = autorun(() => {
            if (!this.approval || !this.selectedKey || !this.account) return

            const { recipient, amount } = this.approval.requestData
            const messageToPrepare: TransferMessageToPrepare = {
                publicKey: this.selectedKey.publicKey,
                recipient,
                amount,
                payload: undefined,
            }

            this.rpcStore.rpc
                .estimateFees(this.account.tonWallet.address, messageToPrepare, {})
                .then(action(fees => {
                    this.fees = fees
                }))
                .catch(this.logger.error)
        })

        this.getTokenRootDetailsDisposer = autorun(() => {
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
                        old: details.version !== 'Tip3',
                    }
                }))
                .catch(this.logger.error)
        })
    }

    public dispose(): void | Promise<void> {
        this.estimateFeesDisposer()
        this.getTokenRootDetailsDisposer()
    }

    public get approval(): PendingApproval<'sendMessage'> {
        return this.approvalStore.approval as PendingApproval<'sendMessage'>
    }

    public get networkName(): string {
        return this.rpcStore.state.selectedConnection.name
    }

    public get account(): nt.AssetsList {
        return this.accountability.accountEntries[this.approval.requestData.sender]
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get selectableKeys(): SelectableKeys | undefined {
        if (!this.account) return undefined

        return this.accountability.getSelectableKeys(this.account)
    }

    public get contractState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.account.tonWallet.address]
    }

    public get balance(): Decimal {
        return new Decimal(this.contractState?.balance ?? '0')
    }

    public get isDeployed(): boolean {
        return this.contractState?.isDeployed
            || !this.nekoton.getContractTypeDetails(this.account.tonWallet.contractType).requiresSeparateDeploy
    }

    public get messageAmount(): MessageAmount {
        return !this.tokenTransaction
            ? { type: 'ton_wallet', data: { amount: this.approval.requestData.amount }}
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

    public setKey(key: nt.KeyStoreEntry | undefined): void {
        this.selectedKey = key
    }

    public async onReject(): Promise<void> {
        this.loading = true
        await this.approvalStore.rejectPendingApproval()
    }

    public async onSubmit(keyPassword: nt.KeyPassword): Promise<void> {
        if (this.loading) return

        this.loading = true

        try {
            const isValid = ignoreCheckPassword(keyPassword) || await this.rpcStore.rpc.checkPassword(keyPassword)

            if (isValid) {
                await this.approvalStore.resolvePendingApproval(keyPassword, true)
            }
            else {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' })
                })
            }
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

}

export enum Step {
    MessagePreview,
    EnterPassword,
}

interface TokenTransaction {
    amount: string
    symbol: string
    decimals: number
    rootTokenContract: string
    old: boolean
}
