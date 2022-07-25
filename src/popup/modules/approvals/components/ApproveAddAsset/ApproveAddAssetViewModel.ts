import type nt from '@wallet/nekoton-wasm'
import {
    action, autorun, makeAutoObservable, runInAction,
} from 'mobx'
import { Disposable, injectable } from 'tsyringe'

import {
    AccountabilityStore, RpcStore, TokensManifestItem, TokensStore,
} from '@app/popup/modules/shared'
import { ConnectionDataItem, PendingApproval } from '@app/models'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveAddAssetViewModel implements Disposable {

    balance = ''

    loading = false

    private disposer: () => void

    constructor(
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
    ) {
        makeAutoObservable<ApproveAddAssetViewModel, any>(this, {
            rpcStore: false,
            approvalStore: false,
            accountability: false,
            tokensStore: false,
        })

        this.disposer = autorun(() => {
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

    dispose(): void | Promise<void> {
        this.disposer()
    }

    get approval() {
        return this.approvalStore.approval as PendingApproval<'addTip3Token'>
    }

    get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    get account(): nt.AssetsList | undefined {
        return Object.values(this.accountability.accountEntries).find(
            account => account.tonWallet.publicKey === this.approval.requestData.account,
        )
    }

    get tokensMeta(): Record<string, TokensManifestItem> {
        return this.tokensStore.meta
    }

    get manifestData() {
        return this.tokensMeta[this.approval.requestData.details.address]
    }

    get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    get phishingAttempt(): PhishingAttempt | undefined {
        const additionalAssets = this.account!.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
        const { details } = this.approval.requestData
        let phishingAttempt: PhishingAttempt | undefined,
            existingToken = ExistingToken.None

        if (this.tokensMeta) {
            for (const { rootTokenContract } of additionalAssets) {
                const info = this.knownTokens[rootTokenContract] as nt.Symbol | undefined

                if (info == null || info.name !== details.symbol) {
                    continue
                }

                existingToken = this.tokensMeta[info.rootTokenContract]
                    ? ExistingToken.Trusted : ExistingToken.Untrusted
                break
            }
        }

        for (const info of Object.values(this.tokensMeta || {})) {
            if (info.symbol === details.symbol && info.address !== details.address) {
                phishingAttempt = PhishingAttempt.Explicit
                break
            }
        }

        if (existingToken === ExistingToken.Untrusted && this.manifestData) {
            phishingAttempt = PhishingAttempt.Suggestion
        }
        else if (existingToken !== ExistingToken.None) {
            phishingAttempt = PhishingAttempt.SameSymbol
        }

        return phishingAttempt
    }

    onReject = async () => {
        this.loading = true
        await this.approvalStore.rejectPendingApproval()
    }

    onSubmit = async () => {
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
