import * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { action, makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { type Nekoton, PendingApproval, TransferMessageToPrepare } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    LocalizationStore,
    Logger,
    NekotonToken,
    RpcStore,
    SelectableKeys,
    Utils,
} from '@app/popup/modules/shared'
import { parseError, prepareKey } from '@app/popup/utils'
import { requiresSeparateDeploy } from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveTonSendMessageViewModel {

    public loading = false

    public error = ''

    public fees = ''

    public txErrorsLoaded = false

    public txErrors: nt.TransactionTreeSimulationError[] = []

    public keyEntry: nt.KeyStoreEntry | undefined

    public tokenTransaction: TokenTransaction[] = []

    public ledgerConnect = false

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
            if (!this.approval || !this.keyEntry || !this.accountAddress) return

            const messageToPrepare: TransferMessageToPrepare = {
                publicKey: this.keyEntry.publicKey,
                params: this.approval.requestData.params.map(({ destination, ...item }) => ({
                    ...item,
                    recipient: destination,
                })),
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
                .simulateTransactionTree(this.accountAddress, messageToPrepare, {})
                .then(action(errors => {
                    this.txErrors = errors
                }))
                .catch(this.logger.error)
                .finally(action(() => {
                    this.txErrorsLoaded = true
                }))
        })

        utils.autorun(async () => {
            if (!this.approval) return

            await Promise.all(this.approval.requestData.params.map(async item => {
                const knownPayload = nt.parseKnownPayload(item.body || '')

                if (
                    knownPayload?.type !== 'jetton_outgoing_transfer'
                ) {
                    this.tokenTransaction.push({
                        attachedAmount: item.amount,
                        symbol: this.nativeCurrency,
                        decimals: this.connectionStore.decimals ?? 0,
                        destination: item.destination,
                        payload: item.body,
                        isNative: true,
                    })

                    return
                }

                try {
                    const details = await this.rpcStore.rpc.getJettonRootDetailsFromJettonWallet(item.destination)
                    const symbol = await this.rpcStore.rpc.getJettonSymbol({ ...details,
                        jettonWallet: item.destination })

                    runInAction(() => {
                        this.tokenTransaction.push({
                            amount: knownPayload.data.tokens,
                            attachedAmount: item.amount,
                            symbol: symbol.name ?? details.symbol ?? 'UNKNOWN',
                            decimals: symbol.decimals ?? 0,
                            rootTokenContract: details.address,
                            imageUrl: symbol.uri,
                            payload: item.body,
                            destination: item.destination,
                        })
                    })
                }
                catch (error) {
                    runInAction(() => {
                        this.tokenTransaction.push({
                            attachedAmount: item.amount,
                            amount: knownPayload.data.tokens,
                            symbol: 'UNKNOWN',
                            decimals: 9,
                            payload: item.body,
                            destination: item.destination,
                        })
                    })

                    this.logger.error(error)
                }
            }))
        })

        utils.autorun(() => {
            if (!this.accountAddress) return
            this.rpcStore.rpc.updateContractState([this.accountAddress]).catch(this.logger.error)
        })

        utils.when(() => this.keyEntry?.signerName === 'ledger_key', async () => {
            const connected = await ledger.checkLedger()
            if (!connected) {
                runInAction(() => {
                    this.ledgerConnect = true
                })
            }
        })

        utils.when(() => !!this.selectableKeys?.keys[0], () => {
            this.keyEntry = this.selectableKeys?.keys[0]
        })
    }

    public get approval(): PendingApproval<'tonSendMessage'> {
        return this.approvalStore.approval as PendingApproval<'tonSendMessage'>
    }

    public get account(): nt.AssetsList | undefined {
        if (!this.approval) return undefined
        return this.approval.requestData.sender ? this.accountability
            .accountEntries[this.approval.requestData.sender] : this.accountability.selectedAccount
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
        return this.balance.isLessThan(this.approval.requestData.params.reduce((
            acc,
            item,
        ) => acc.plus(item.amount ?? 0), BigNumber(0)))
    }

    public get isDeployed(): boolean {
        return !!this.account
            && (this.contractState?.isDeployed
                || !requiresSeparateDeploy(this.account.tonWallet.contractType, this.connectionStore.connectionConfig))
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get nativeDecimals(): number {
        return this.connectionStore.decimals
    }

    public setKey(key: nt.KeyStoreEntry | undefined): void {
        this.keyEntry = key
    }

    public async onReject(): Promise<void> {
        this.loading = true
        await this.approvalStore.rejectPendingApproval()
    }

    public async onSubmit(password?: string, cache?: boolean): Promise<void> {
        if (!this.keyEntry) {
            this.error = this.localization.intl.formatMessage({ id: 'ERROR_KEY_ENTRY_NOT_FOUND' })
            return
        }

        if (this.loading) return
        this.loading = true
        this.error = ''

        try {
            const { keyEntry, account } = this
            const wallet = account!.tonWallet.contractType
            const keyPassword = prepareKey({ keyEntry, password, cache, wallet })
            const isValid = await this.utils.checkPassword(keyPassword)

            if (!isValid) {
                throw new Error(
                    this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' }),
                )
            }

            await this.approvalStore.resolvePendingApproval(keyPassword, true)
        }
        catch (e: any) {
            this.setError(parseError(e))
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public handleLedgerConnected(): void {
        this.ledgerConnect = false
    }

    public async handleLedgerFailed(): Promise<void> {
        await this.approvalStore.rejectPendingApproval()
    }

    private setError(error: string): void {
        this.error = error
    }

}

interface TokenTransaction {
    amount?: string
    attachedAmount: string
    symbol: string
    destination: string
    decimals: number
    imageUrl?: string
    payload?: string
    rootTokenContract?: string
    isNative?: boolean
}
