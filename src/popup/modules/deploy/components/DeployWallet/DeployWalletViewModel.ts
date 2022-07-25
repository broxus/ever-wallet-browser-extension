import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { Disposable, inject, injectable } from 'tsyringe'

import { DeployMessageToPrepare, Nekoton, WalletMessageToSend } from '@app/models'
import {
    AccountabilityStore, createEnumField, DrawerContext, NekotonToken, RpcStore,
} from '@app/popup/modules/shared'
import { getScrollWidth, parseError, prepareKey } from '@app/popup/utils'
import { Logger, NATIVE_CURRENCY } from '@app/shared'

@injectable()
export class DeployWalletViewModel implements Disposable {

    drawer!: DrawerContext

    step = createEnumField(Step, Step.SelectType)

    walletType = WalletType.Standard

    loading = false

    error = ''

    fees = ''

    private disposer: () => void

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable<DeployWalletViewModel, any>(this, {
            nekoton: false,
            rpcStore: false,
            accountability: false,
            logger: false,
        })

        this.disposer = autorun(async () => {
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

    dispose(): void {
        this.disposer()
    }

    get tonWalletAsset(): nt.TonWalletAsset {
        return this.accountability.selectedAccount!.tonWallet
    }

    get address() {
        return this.tonWalletAsset.address
    }

    get isDeployed(): boolean {
        return this.tonWalletState?.isDeployed ?? false
    }

    get selectedDerivedKeyEntry() {
        return this.accountability.storedKeys[this.tonWalletAsset.publicKey]
    }

    get tonWalletState(): nt.ContractState | undefined {
        return this.accountability.tonWalletState
    }

    get balance(): Decimal {
        return new Decimal(this.tonWalletState?.balance || '0')
    }

    get totalAmount(): string {
        return Decimal.max(
            '100000000',
            new Decimal('10000000').add(this.fees || '0'),
        ).toString()
    }

    get sufficientBalance(): boolean {
        return this.balance.greaterThanOrEqualTo(this.totalAmount)
    }

    onBack = () => this.step.setSelectType()

    onChangeWalletType = (walletType: WalletType) => {
        this.walletType = walletType
    }

    onSubmit = async (password?: string, cache?: boolean) => {
        const keyPassword = prepareKey({
            cache,
            password,
            keyEntry: this.selectedDerivedKeyEntry,
            context: {
                address: this.address,
                amount: '0',
                asset: NATIVE_CURRENCY,
                decimals: 9,
            },
        })
        const params: DeployMessageToPrepare = { type: 'single_owner' }

        this.loading = true
        this.error = ''

        try {
            const signedMessage = await this.rpcStore.rpc.prepareDeploymentMessage(this.address, params, keyPassword)
            const message: WalletMessageToSend = { signedMessage, info: { type: 'deploy', data: undefined } }

            this.rpcStore.rpc.sendMessage(this.address, message).catch(this.logger.error)
            this.drawer.setPanel(undefined)
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

    onNext = async () => {
        if (this.walletType === WalletType.Multisig) {
            await this.rpcStore.rpc.openExtensionInExternalWindow({
                group: 'deploy_multisig_wallet',
                width: 360 + getScrollWidth() - 1,
                height: 600 + getScrollWidth() - 1,
            })

            this.drawer.setPanel(undefined)
        }
        else if (this.step.value === Step.SelectType) {
            this.step.setDeployMessage()
        }
        else {
            this.step.setSelectType()
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
