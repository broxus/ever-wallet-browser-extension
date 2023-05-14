import type * as nt from '@broxus/ever-wallet-wasm'
import { action, makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore, Token, TokensStore, Utils } from '@app/popup/modules/shared'
import { ConnectionDataItem, PendingApproval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveAddAssetViewModel {

    public balance = ''

    public loading = false

    constructor(
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.autorun(() => {
            const { tokenWallet } = this.approval.requestData.details

            this.rpcStore.rpc.getTokenWalletBalance(tokenWallet)
                .then(action(balance => {
                    this.balance = balance
                }))
                .catch(action(() => {
                    this.balance = '0'
                }))
        })
    }

    public get approval(): PendingApproval<'addTip3Token'> {
        return this.approvalStore.approval as PendingApproval<'addTip3Token'>
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get account(): nt.AssetsList | undefined {
        return Object.values(this.accountability.accountEntries).find(
            account => account.tonWallet.address === this.approval.requestData.account,
        )
    }

    public get tokens(): Record<string, Token | undefined> {
        return this.tokensStore.tokens
    }

    public get token(): Token | undefined {
        return this.tokens[this.approval.requestData.details.address]
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get phishingAttempt(): PhishingAttempt | undefined {
        const additionalAssets = this.account!.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
        const { details } = this.approval.requestData
        let phishingAttempt: PhishingAttempt | undefined,
            existingToken = ExistingToken.None

        if (this.tokens) {
            for (const { rootTokenContract } of additionalAssets) {
                const info = this.knownTokens[rootTokenContract] as nt.Symbol | undefined

                if (info == null || info.name !== details.symbol) {
                    continue
                }

                existingToken = this.tokens[info.rootTokenContract]
                    ? ExistingToken.Trusted : ExistingToken.Untrusted
                break
            }
        }

        for (const info of Object.values(this.tokens || {})) {
            if (info?.symbol === details.symbol && info?.address !== details.address) {
                phishingAttempt = PhishingAttempt.Explicit
                break
            }
        }

        if (existingToken === ExistingToken.Untrusted && this.token) {
            phishingAttempt = PhishingAttempt.Suggestion
        }
        else if (existingToken !== ExistingToken.None) {
            phishingAttempt = PhishingAttempt.SameSymbol
        }

        return phishingAttempt
    }

    public async onReject(): Promise<void> {
        this.loading = true
        await this.approvalStore.rejectPendingApproval()
    }

    public async onSubmit(): Promise<void> {
        this.loading = true

        try {
            await this.approvalStore.resolvePendingApproval({})
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}

export enum TokenNotificationType {
    Error,
    Warning,
}

export enum PhishingAttempt {
    Explicit,
    SameSymbol,
    Suggestion,
}

export enum ExistingToken {
    None,
    Trusted,
    Untrusted,
}
