import type nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type { DeployMessageToPrepare, Nekoton, WalletMessageToSend } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    Drawer,
    Logger,
    NekotonToken,
    RpcStore,
    Utils,
} from '@app/popup/modules/shared'
import { getScrollWidth, parseError, prepareKey, prepareLedgerSignatureContext } from '@app/popup/utils'
import { NATIVE_CURRENCY_DECIMALS } from '@app/shared'

@injectable()
export class DeployWalletViewModel {

    public step = createEnumField<typeof Step>(Step.SelectType)

    public walletType = WalletType.Standard

    public loading = false

    public error = ''

    public fees = ''

    constructor(
        public drawer: Drawer,
        @inject(NekotonToken) private nekoton: Nekoton,
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

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.everWalletState
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
        this.step.setValue(Step.SelectType)
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
            context: prepareLedgerSignatureContext(this.nekoton, {
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
            this.drawer.close()
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

            this.drawer.close()
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
