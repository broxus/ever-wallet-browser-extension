import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import { autorun, makeAutoObservable, runInAction, when } from 'mobx'
import { Disposable, inject, injectable } from 'tsyringe'

import type {
    MessageAmount,
    Nekoton,
    TokenMessageToPrepare,
    TransferMessageToPrepare,
    WalletMessageToSend,
    WithdrawRequest,
} from '@app/models'
import {
    AccountabilityStore,
    AppConfig,
    createEnumField,
    LocalizationStore,
    NekotonToken,
    RpcStore,
    SelectableKeys,
    StakeStore,
} from '@app/popup/modules/shared'
import { getScrollWidth, parseError } from '@app/popup/utils'
import {
    interval,
    Logger,
    parseCurrency,
    parseEvers,
    ST_EVER,
    ST_EVER_DECIMALS,
    STAKE_DEPOSIT_ATTACHED_AMOUNT,
    STAKE_REMOVE_PENDING_WITHDRAW_AMOUNT,
    STAKE_WITHDRAW_ATTACHED_AMOUNT,
} from '@app/shared'
import { ConnectionDataItem } from '@app/models'

@injectable()
export class StakePrepareMessageViewModel implements Disposable {

    public readonly selectedAccount: nt.AssetsList

    public step = createEnumField(Step, Step.EnterAmount)

    public tab = createEnumField(Tab, Tab.Stake)

    public messageParams: MessageParams | undefined

    public messageToPrepare: TransferMessageToPrepare | undefined

    public selectedKey: nt.KeyStoreEntry | undefined = this.selectableKeys.keys[0]

    public loading = false

    public ledgerLoading = false

    public error = ''

    public fees = ''

    public stEverBalance = '0'

    private ledgerCheckerDisposer: () => void

    private estimateDisposer: () => void

    private balanceDisposer: () => void

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private localization: LocalizationStore,
        private config: AppConfig,
        private logger: Logger,
    ) {
        makeAutoObservable<StakePrepareMessageViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
            stakeStore: false,
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

        this.estimateDisposer = autorun(() => {
            if (this.messageToPrepare) {
                this.estimateFees(this.messageToPrepare).catch(logger.error)
            }
        })

        this.balanceDisposer = interval(this.updateStEverBalance, 10_000)

        this.stakeStore.getDetails().catch(this.logger.error)
        this.updateStEverBalance().catch(this.logger.error)
    }

    dispose(): Promise<void> | void {
        this.ledgerCheckerDisposer()
        this.estimateDisposer()
        this.balanceDisposer()
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
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

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.selectedAccount.tonWallet
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.selectedAccount.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
    }

    public get balance(): Decimal {
        return this.tab.is(Tab.Stake)
            ? new Decimal(this.everWalletState?.balance || '0')
            : new Decimal(this.stEverBalance)
    }

    public get balanceError(): string | undefined {
        if (!this.fees || !this.messageParams) return undefined

        const everBalance = new Decimal(this.everWalletState?.balance || '0')
        const fees = new Decimal(this.fees)
        let amount: Decimal

        if (this.messageParams.amount.type === 'ever_wallet') {
            amount = new Decimal(this.messageParams.amount.data.amount)
        }
        else {
            amount = new Decimal(this.messageParams.amount.data.attachedAmount)
        }

        if (everBalance.lessThan(amount.add(fees))) {
            return this.localization.intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })
        }

        return undefined
    }

    public get withdrawRequests(): WithdrawRequest[] {
        const { address } = this.selectedAccount.tonWallet
        return Object.values(this.stakeStore.withdrawRequests[address] ?? {})
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
        if (!this.selectedKey) {
            this.error = 'Signer key not selected'
            return
        }

        const messageToPrepare: TransferMessageToPrepare = {
            publicKey: this.selectedKey.publicKey,
            recipient: this.nekoton.repackAddress(this.stakeStore.stEverVault),
            amount: STAKE_REMOVE_PENDING_WITHDRAW_AMOUNT,
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
            this.step.setEnterPassword()
        })
    }

    public async submitMessageParams(data: StakeFromData): Promise<void> {
        if (!this.selectedKey) {
            this.error = 'Signer key not selected'
            return
        }

        try {
            let messageParams: MessageParams,
                messageToPrepare: TransferMessageToPrepare

            if (this.tab.is(Tab.Stake)) {
                // deposit
                messageToPrepare = {
                    publicKey: this.selectedKey.publicKey,
                    recipient: this.nekoton.repackAddress(this.stakeStore.stEverVault),
                    amount: Decimal.add(parseEvers(data.amount), STAKE_DEPOSIT_ATTACHED_AMOUNT).toFixed(),
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
                const tokenRecipient = this.nekoton.repackAddress(this.stakeStore.stEverVault)
                const payload = await this.stakeStore.encodeDepositPayload()

                const internalMessage = await this.prepareTokenMessage(
                    this.everWalletAsset.address,
                    {
                        amount: tokenAmount,
                        recipient: tokenRecipient,
                        payload,
                        notifyReceiver: true,
                        attachedAmount: STAKE_WITHDRAW_ATTACHED_AMOUNT,
                    },
                )

                messageToPrepare = {
                    publicKey: this.selectedKey.publicKey,
                    recipient: internalMessage.destination,
                    amount: internalMessage.amount,
                    payload: internalMessage.body,
                    bounce: true,
                }
                messageParams = {
                    amount: {
                        type: 'token_wallet',
                        data: {
                            amount: tokenAmount,
                            attachedAmount: messageToPrepare.amount,
                            symbol: ST_EVER,
                            decimals: ST_EVER_DECIMALS,
                            rootTokenContract: this.stakeStore.stEverTokenRoot,
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
                this.step.setEnterPassword()
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

            if (this.messageParams?.action === 'stake') {
                const { address } = this.selectedAccount.tonWallet
                const { stEverTokenRoot } = this.stakeStore
                const hasStEverAsset = this.tokenWalletAssets
                    .some(({ rootTokenContract }) => rootTokenContract === stEverTokenRoot)

                if (!hasStEverAsset) {
                    await this.rpcStore.rpc.updateTokenWallets(address, {
                        [this.stakeStore.stEverTokenRoot]: true,
                    })
                }
            }

            this.step.setStakeResult()
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

    private prepareMessage(
        params: TransferMessageToPrepare,
        password: nt.KeyPassword,
    ): Promise<nt.SignedMessage> {
        return this.rpcStore.rpc.prepareTransferMessage(this.everWalletAsset.address, params, password)
    }

    private prepareTokenMessage(owner: string, params: TokenMessageToPrepare): Promise<nt.InternalMessage> {
        return this.stakeStore.prepareStEverMessage(owner, params)
    }

    private sendMessage(message: WalletMessageToSend): Promise<void> {
        return this.rpcStore.rpc.sendMessage(this.everWalletAsset.address, message)
    }

    private async updateStEverBalance(): Promise<void> {
        try {
            const balance = await this.stakeStore.getStEverBalance(this.selectedAccount.tonWallet.address)
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
