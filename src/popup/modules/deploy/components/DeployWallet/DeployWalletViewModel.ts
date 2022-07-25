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

    public drawer!: DrawerContext

    public step = createEnumField(Step, Step.SelectType)

    public walletType = WalletType.Standard

    public loading = false

    public error = ''

    public fees = ''

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
        }, { autoBind: true })

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

    public dispose(): void {
        this.disposer()
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.accountability.selectedAccount!.tonWallet
    }

    public get address(): string {
        return this.everWalletAsset.address
    }

    public get isDeployed(): boolean {
        return this.everWalletState?.isDeployed ?? false
    }

    public get selectedDerivedKeyEntry(): nt.KeyStoreEntry {
        return this.accountability.storedKeys[this.everWalletAsset.publicKey]
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
    }

    public get balance(): Decimal {
        return new Decimal(this.everWalletState?.balance || '0')
    }

    public get totalAmount(): string {
        return Decimal.max(
            '100000000',
            new Decimal('10000000').add(this.fees || '0'),
        ).toString()
    }

    public get sufficientBalance(): boolean {
        return this.balance.greaterThanOrEqualTo(this.totalAmount)
    }

    public onBack(): void {
        this.step.setSelectType()
    }

    public onChangeWalletType(walletType: WalletType): void {
        this.walletType = walletType
    }

    public async onSubmit(password?: string, cache?: boolean): Promise<void> {
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
            const message: WalletMessageToSend = { signedMessage, info: { type: 'deploy', data: undefined }}

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

    public async onNext(): Promise<void> {
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
