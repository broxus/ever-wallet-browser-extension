/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type {
    MessageAmount,
    Nekoton,
    TokenMessageToPrepare,
    TransferMessageToPrepare,
    WalletMessageToSend,
    WithdrawRequest,
} from '@app/models'
import { ConnectionDataItem } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    LocalizationStore,
    Logger,
    NekotonToken,
    RpcStore,
    SelectableKeys,
    StakeStore,
    Utils,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import {
    NATIVE_CURRENCY_DECIMALS,
    parseCurrency,
    parseEvers,
    ST_EVER_DECIMALS,
} from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'

@injectable()
export class StakePrepareMessageViewModel {

    public readonly selectedAccount: nt.AssetsList

    public step = createEnumField<typeof Step>(Step.EnterAmount)

    public tab = createEnumField<typeof Tab>(Tab.Stake)

    public messageParams: MessageParams | undefined

    public messageToPrepare: TransferMessageToPrepare | undefined

    public selectedKey: nt.KeyStoreEntry | undefined

    public loading = false

    public error = ''

    public fees = ''

    public txErrorsLoaded = false

    public txErrors: nt.TransactionTreeSimulationError[] = []

    public stEverBalance = '0'

    constructor(
        public ledger: LedgerUtils,
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
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

        utils.autorun(() => {
            if (this.messageToPrepare) {
                this.estimateFees(this.messageToPrepare).catch(logger.error)
                this.simulateTransactionTree(this.messageToPrepare).catch(logger.error)
            }
        })

        utils.interval(this.updateStEverBalance, 10_000)

        this.updateStEverBalance().catch(this.logger.error)

        utils.when(() => !!this.selectableKeys.keys[0], () => {
            this.selectedKey = this.selectableKeys.keys[0]
        })
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get selectableKeys(): SelectableKeys {
        return this.accountability.getSelectableKeys(this.selectedAccount)
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.selectedAccount.tonWallet.address]
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.selectedAccount.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
    }

    public get balance(): BigNumber {
        return this.tab.is(Tab.Stake)
            ? new BigNumber(this.everWalletState?.balance || '0')
            : new BigNumber(this.stEverBalance)
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

    public get withdrawRequests(): WithdrawRequest[] {
        const { address } = this.selectedAccount.tonWallet
        return Object.values(this.stakeStore.withdrawRequests[address] ?? {})
    }

    public get context(): nt.LedgerSignatureContext | undefined {
        if (!this.selectedKey || !this.messageParams) return undefined

        return this.ledger.prepareContext({
            type: 'transfer',
            everWallet: this.selectedAccount.tonWallet,
            custodians: this.accountability.accountCustodians[this.selectedAccount.tonWallet.address],
            key: this.selectedKey,
            decimals: this.messageParams.amount.type === 'ever_wallet' ? NATIVE_CURRENCY_DECIMALS : ST_EVER_DECIMALS,
            asset: this.messageParams.amount.type === 'ever_wallet' ? this.nativeCurrency : this.tokenCurrency.toUpperCase(),
        })
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public get tokenCurrency(): string {
        return this.stakeStore.config!.tokenSymbol
    }

    public onChangeKeyEntry(value: nt.KeyStoreEntry): void {
        this.selectedKey = value

        if (this.messageParams) {
            this.submitMessageParams({
                amount: this.messageParams.originalAmount,
            }).catch(this.logger.error)
        }
    }

    public handleTabChange(tab: Tab): void {
        this.messageToPrepare = undefined
        this.messageParams = undefined
        this.tab.setValue(tab)
    }

    public async removePendingWithdraw([nonce]: WithdrawRequest): Promise<void> {
        const { prices } = this.stakeStore

        if (!prices) return

        if (!this.selectedKey) {
            this.error = this.localization.intl.formatMessage({
                id: 'ERROR_SIGNER_KEY_NOT_SELECTED',
            })
            return
        }

        const messageToPrepare: TransferMessageToPrepare = {
            publicKey: this.selectedKey.publicKey,
            recipient: this.nekoton.repackAddress(this.stakeStore.stEverVault!),
            amount: prices.removePendingWithdrawAttachedAmount,
            payload: this.stakeStore.getRemovePendingWithdrawPayload(nonce),
            bounce: true,
        }
        const messageParams: MessageParams = {
            amount: { type: 'ever_wallet', data: { amount: messageToPrepare.amount }},
            originalAmount: '',
            action: 'cancel',
        }

        runInAction(() => {
            this.messageToPrepare = messageToPrepare
            this.messageParams = messageParams
            this.step.setValue(Step.EnterPassword)
        })
    }

    public async submitMessageParams(data: StakeFromData): Promise<void> {
        const { prices } = this.stakeStore

        if (!prices) return

        if (!this.selectedKey) {
            this.error = this.localization.intl.formatMessage({
                id: 'ERROR_SIGNER_KEY_NOT_SELECTED',
            })
            return
        }

        try {
            let messageParams: MessageParams,
                messageToPrepare: TransferMessageToPrepare

            if (this.tab.is(Tab.Stake)) {
                // deposit
                messageToPrepare = {
                    publicKey: this.selectedKey.publicKey,
                    recipient: this.nekoton.repackAddress(this.stakeStore.stEverVault!),
                    amount: BigNumber.sum(parseEvers(data.amount), prices.depositAttachedAmount).toFixed(),
                    payload: this.stakeStore.getDepositMessagePayload(parseEvers(data.amount)),
                    bounce: true,
                }
                messageParams = {
                    amount: { type: 'ever_wallet', data: { amount: messageToPrepare.amount }},
                    originalAmount: data.amount,
                    action: 'stake',
                }
            }
            else {
                // withdraw
                const tokenAmount = parseCurrency(data.amount, ST_EVER_DECIMALS)
                const tokenRecipient = this.nekoton.repackAddress(this.stakeStore.stEverVault!)
                const payload = await this.stakeStore.encodeDepositPayload()

                const internalMessage = await this.prepareTokenMessage(
                    this.everWalletAsset.address,
                    this.stakeStore.stEverTokenRoot!,
                    {
                        amount: tokenAmount,
                        recipient: tokenRecipient,
                        payload,
                        notifyReceiver: true,
                    },
                )

                messageToPrepare = {
                    publicKey: this.selectedKey.publicKey,
                    recipient: internalMessage.destination,
                    amount: prices.withdrawAttachedAmount,
                    payload: internalMessage.body,
                    bounce: true,
                }
                messageParams = {
                    amount: {
                        type: 'token_wallet',
                        data: {
                            amount: tokenAmount,
                            attachedAmount: messageToPrepare.amount,
                            symbol: this.tokenCurrency.toUpperCase(),
                            decimals: ST_EVER_DECIMALS,
                            rootTokenContract: this.stakeStore.stEverTokenRoot!,
                            old: false,
                        },
                    },
                    originalAmount: data.amount,
                    action: 'unstake',
                }
            }

            runInAction(() => {
                this.messageToPrepare = messageToPrepare
                this.messageParams = messageParams
                this.step.setValue(Step.EnterPassword)
            })
        }
        catch (e: any) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
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

            if (this.messageParams?.action === 'stake') {
                const { address } = this.selectedAccount.tonWallet
                const { stEverTokenRoot } = this.stakeStore
                const hasStEverAsset = this.tokenWalletAssets
                    .some(({ rootTokenContract }) => rootTokenContract === stEverTokenRoot)

                if (!hasStEverAsset) {
                    await this.rpcStore.rpc.updateTokenWallets(address, {
                        [this.stakeStore.stEverTokenRoot!]: true,
                    })
                }
            }

            this.step.setValue(Step.StakeResult)
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

    private async estimateFees(params: TransferMessageToPrepare) {
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
        this.txErrorsLoaded = false

        try {
            const errors = await this.rpcStore.rpc.simulateTransactionTree(this.everWalletAsset.address, params, {})

            runInAction(() => {
                this.txErrors = errors
            })
        }
        catch (e) {
            this.logger.error(e)
        }
        finally {
            runInAction(() => {
                this.txErrorsLoaded = true
            })
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

    private async updateStEverBalance(): Promise<void> {
        try {
            const balance = await this.rpcStore.rpc.getTokenBalance(
                this.selectedAccount.tonWallet.address,
                this.stakeStore.stEverTokenRoot!,
            )
            runInAction(() => {
                this.stEverBalance = balance
            })
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}

interface MessageParams {
    amount: MessageAmount;
    originalAmount: string;
    action: 'stake' | 'unstake' | 'cancel';
}

export interface StakeFromData {
    amount: string;
}

export enum Step {
    EnterAmount,
    EnterPassword,
    LedgerConnect,
    StakeResult,
}

export enum Tab {
    Stake,
    Unstake,
    InProgress,
}
