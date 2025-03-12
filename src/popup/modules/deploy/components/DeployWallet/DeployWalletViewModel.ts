import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import type { DeployMessageToPrepare, WalletMessageToSend } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    Logger,
    RpcStore,
    SlidingPanelHandle,
    Utils,
} from '@app/popup/modules/shared'
import { getScrollWidth, parseError, prepareKey } from '@app/popup/utils'
import { LedgerUtils } from '@app/popup/modules/ledger'

import { WalletType } from './models'

@injectable()
export class DeployWalletViewModel {

    public address!: string

    public step = createEnumField<typeof Step>(Step.SelectType)

    public walletType = WalletType.Standard

    public loading = false

    public error = ''

    public fees = ''

    constructor(
        public ledger: LedgerUtils,
        private handle: SlidingPanelHandle,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

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
        return BigNumber.max('100000000', new BigNumber('10000000').plus(this.fees || '0')).toString()
    }

    public get sufficientBalance(): boolean {
        return this.balance.isGreaterThanOrEqualTo(this.totalAmount)
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public onClose(): void {
        this.handle.close()
    }

    public onBack(): void {
        this.step.setValue(Step.SelectType)
    }

    public onChangeWalletType(walletType: WalletType): void {
        this.walletType = walletType
    }

    public async onSubmit(password?: string): Promise<boolean> {
        const keyPassword = prepareKey({
            password,
            cache: false,
            keyEntry: this.selectedDerivedKeyEntry,
            wallet: this.everWalletAsset.contractType,
            context: this.ledger.prepareContext({
                type: 'deploy',
                everWallet: this.everWalletAsset,
                asset: this.nativeCurrency,
                decimals: this.connectionStore.decimals,
            }),
        })
        const params: DeployMessageToPrepare = { type: 'single_owner' }

        this.loading = true
        this.error = ''

        try {
            const signedMessage = await this.rpcStore.rpc.prepareDeploymentMessage(this.address, params, keyPassword)
            const message: WalletMessageToSend = { signedMessage, info: { type: 'deploy', data: undefined }}

            this.rpcStore.rpc.sendMessage(this.address, message).catch(this.logger.error)
        }
        catch (e) {
            runInAction(() => {
                this.error = parseError(e)
            })

            return false
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }

        return true
    }

    public async onNext(): Promise<void> {
        if (this.walletType === WalletType.Multisig) {
            await this.rpcStore.rpc.openExtensionInExternalWindow({
                group: 'deploy_multisig_wallet',
                width: 360 + getScrollWidth() - 1,
                height: 600 + getScrollWidth() - 1,
            })

            this.handle.close()
        }
        else {
            this.step.setValue(Step.DeployMessage)
        }
    }

}

export enum Step {
    SelectType,
    DeployMessage,
}
