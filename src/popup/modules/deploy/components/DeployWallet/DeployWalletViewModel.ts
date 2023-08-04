import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import type { DeployMessageToPrepare, WalletMessageToSend } from '@app/models'
import { AccountabilityStore, ConnectionStore, createEnumField, Logger, Router, RpcStore, Utils } from '@app/popup/modules/shared'
import { getScrollWidth, parseError, prepareKey } from '@app/popup/utils'
import { NATIVE_CURRENCY_DECIMALS } from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'

@injectable()
export class DeployWalletViewModel {

    public step = createEnumField<typeof Step>(Step.SelectType)

    public walletType = WalletType.Standard

    public loading = false

    public error = ''

    public fees = ''

    public readonly address: string

    constructor(
        public ledger: LedgerUtils,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.address = this.router.state.matches.at(-1)!.params.address as string

        utils.autorun(async () => {
            if (this.isDeployed) return

            try {
                const fees = await this.rpcStore.rpc.estimateDeploymentFees(this.address)

                runInAction(() => {
                    this.fees = fees
                })
            }
            catch (e) {
                this.logger.error(e)
            }
        })
    }

    public get account(): nt.AssetsList {
        return this.accountability.accountEntries[this.address]
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.account.tonWallet
    }

    public get isDeployed(): boolean {
        return this.everWalletState?.isDeployed ?? false
    }

    public get selectedDerivedKeyEntry(): nt.KeyStoreEntry {
        return this.accountability.storedKeys[this.everWalletAsset.publicKey]
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.address]
    }

    public get balance(): BigNumber {
        return new BigNumber(this.everWalletState?.balance || '0')
    }

    public get totalAmount(): string {
        return BigNumber.max(
            '100000000',
            new BigNumber('10000000').plus(this.fees || '0'),
        ).toString()
    }

    public get sufficientBalance(): boolean {
        return this.balance.isGreaterThanOrEqualTo(this.totalAmount)
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public onBack(): void {
        if (this.step.is(Step.DeployMessage)) {
            this.step.setValue(Step.SelectType)
        }
        else {
            this.router.navigate(-1)
        }
    }

    public onChangeWalletType(walletType: WalletType): void {
        this.walletType = walletType
    }

    public async onSubmit(password?: string, cache?: boolean): Promise<void> {
        const keyPassword = prepareKey({
            cache,
            password,
            keyEntry: this.selectedDerivedKeyEntry,
            wallet: this.everWalletAsset.contractType,
            context: this.ledger.prepareContext({
                type: 'deploy',
                everWallet: this.everWalletAsset,
                asset: this.nativeCurrency,
                decimals: NATIVE_CURRENCY_DECIMALS,
            }),
        })
        const params: DeployMessageToPrepare = { type: 'single_owner' }

        this.loading = true
        this.error = ''

        try {
            const signedMessage = await this.rpcStore.rpc.prepareDeploymentMessage(this.address, params, keyPassword)
            const message: WalletMessageToSend = { signedMessage, info: { type: 'deploy', data: undefined }}

            this.rpcStore.rpc.sendMessage(this.address, message).catch(this.logger.error)
            this.router.navigate(-1)
        }
        catch (e) {
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

    public async onNext(): Promise<void> {
        if (this.walletType === WalletType.Multisig) {
            await this.rpcStore.rpc.openExtensionInExternalWindow({
                group: 'deploy_multisig_wallet',
                width: 360 + getScrollWidth() - 1,
                height: 600 + getScrollWidth() - 1,
            })

            this.router.navigate(-1)
        }
        else if (this.step.value === Step.SelectType) {
            this.step.setValue(Step.DeployMessage)
        }
        else {
            this.step.setValue(Step.SelectType)
        }
    }

}

export enum Step {
    SelectType,
    DeployMessage,
}

export enum WalletType {
    Standard,
    Multisig,
}
