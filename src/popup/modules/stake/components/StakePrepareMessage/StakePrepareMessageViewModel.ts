import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type { Nekoton, TokenMessageToPrepare, TransferMessageToPrepare, WithdrawRequest } from '@app/models'
import { ConnectionDataItem } from '@app/models'
import { AccountabilityStore, createEnumField, LocalizationStore, NekotonToken, Router, RpcStore, StakeStore } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { parseCurrency, parseEvers, ST_EVER, ST_EVER_DECIMALS, STAKE_DEPOSIT_ATTACHED_AMOUNT, STAKE_REMOVE_PENDING_WITHDRAW_AMOUNT, STAKE_WITHDRAW_ATTACHED_AMOUNT } from '@app/shared'

import { MessageParams, StakeTransferStore } from '../../store'

@injectable()
export class StakePrepareMessageViewModel {

    public tab = createEnumField<typeof Tab>(fromAction(this.transfer.messageParams?.action))

    public loading = false

    public error = ''

    constructor(
        public transfer: StakeTransferStore,
        @inject(NekotonToken) private nekoton: Nekoton,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private stakeStore: StakeStore,
        private localization: LocalizationStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.transfer.account.tonWallet.address]
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.transfer.account.tonWallet
    }

    public get balance(): BigNumber {
        return this.tab.is(Tab.Stake)
            ? new BigNumber(this.everWalletState?.balance || '0')
            : new BigNumber(this.transfer.stEverBalance)
    }

    public get withdrawRequests(): WithdrawRequest[] {
        const { address } = this.transfer.account.tonWallet
        return Object.values(this.stakeStore.withdrawRequests[address] ?? {})
    }

    public handleTabChange(tab: Tab): void {
        this.transfer.resetMessageParams()
        this.tab.setValue(tab)
    }

    public async removePendingWithdraw([nonce]: WithdrawRequest): Promise<void> {
        if (!this.transfer.key) {
            this.error = this.localization.intl.formatMessage({
                id: 'ERROR_SIGNER_KEY_NOT_SELECTED',
            })
            return
        }

        const messageToPrepare: TransferMessageToPrepare = {
            publicKey: this.transfer.key.publicKey,
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

        this.transfer.submitMessageParams(messageParams, messageToPrepare)
        this.router.navigate('/confirm')
    }

    public async submitMessageParams(data: StakeFromData): Promise<void> {
        if (!this.transfer.key) {
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
                    publicKey: this.transfer.key.publicKey,
                    recipient: this.nekoton.repackAddress(this.stakeStore.stEverVault),
                    amount: BigNumber.sum(parseEvers(data.amount), STAKE_DEPOSIT_ATTACHED_AMOUNT).toFixed(),
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
                    this.stakeStore.stEverTokenRoot,
                    {
                        amount: tokenAmount,
                        recipient: tokenRecipient,
                        payload,
                        notifyReceiver: true,
                    },
                )

                messageToPrepare = {
                    publicKey: this.transfer.key.publicKey,
                    recipient: internalMessage.destination,
                    amount: STAKE_WITHDRAW_ATTACHED_AMOUNT,
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

            this.transfer.submitMessageParams(messageParams, messageToPrepare)
            this.router.navigate('/confirm')
        }
        catch (e: any) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
    }

    private prepareTokenMessage(
        owner: string,
        rootTokenContract: string,
        params: TokenMessageToPrepare,
    ): Promise<nt.InternalMessage> {
        return this.rpcStore.rpc.prepareTokenMessage(owner, rootTokenContract, params)
    }

}

function fromAction(action?: MessageParams['action']): Tab {
    switch (action) {
        case 'stake': return Tab.Stake
        case 'unstake': return Tab.Unstake
        case 'cancel': return Tab.InProgress
        default: return Tab.Stake
    }
}

export interface StakeFromData {
    amount: string;
}

export enum Tab {
    Stake,
    Unstake,
    InProgress,
}
