import type nt from '@wallet/nekoton-wasm'
import {
    autorun, makeAutoObservable, runInAction, when,
} from 'mobx'
import { Disposable, injectable } from 'tsyringe'

import { closeCurrentWindow } from '@app/background'
import { DeployMessageToPrepare, WalletMessageToSend } from '@app/models'
import { AccountabilityStore, createEnumField, RpcStore } from '@app/popup/modules/shared'
import { parseError, prepareKey } from '@app/popup/utils'
import { Logger, NATIVE_CURRENCY } from '@app/shared'

import { MultisigData } from '../MultisigForm'

@injectable()
export class DeployMultisigWalletViewModel implements Disposable {

    public step = createEnumField(Step, Step.EnterData)

    public selectedAccount: nt.AssetsList | undefined

    public multisigData: MultisigData | undefined

    public loading = false

    public error = ''

    public fees = ''

    private disposer: () => void

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable<DeployMultisigWalletViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
            logger: false,
        }, { autoBind: true })

        this.disposer = autorun(async () => {
            if (this.isDeployed || !this.address) return

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

        when(
            () => !!this.accountability.selectedAccount,
            () => {
                this.selectedAccount = this.accountability.selectedAccount
            },
        )
    }

    public dispose(): void {
        this.disposer()
    }

    public get everWalletAsset(): nt.TonWalletAsset | undefined {
        return this.selectedAccount?.tonWallet
    }

    public get address(): string | undefined {
        return this.everWalletAsset?.address
    }

    public get isDeployed(): boolean {
        return this.everWalletState?.isDeployed ?? false
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.address ? this.accountability.accountContractStates[this.address] : undefined
    }

    public get selectedDerivedKeyEntry(): nt.KeyStoreEntry | undefined {
        return this.everWalletAsset ? this.accountability.storedKeys[this.everWalletAsset.publicKey] : undefined
    }

    public sendMessage(message: WalletMessageToSend): void {
        this.rpcStore.rpc.sendMessage(this.address!, message).catch(this.logger.error)
        closeCurrentWindow().catch(this.logger.error)
    }

    public async onSubmit(password?: string): Promise<void> {
        const keyPassword = prepareKey({
            keyEntry: this.selectedDerivedKeyEntry!,
            password,
            context: {
                address: this.address!,
                amount: '0',
                asset: NATIVE_CURRENCY,
                decimals: 9,
            },
        })
        const params: DeployMessageToPrepare = {
            type: 'multiple_owners',
            custodians: this.multisigData?.custodians || [],
            reqConfirms: parseInt(this.multisigData?.reqConfirms as unknown as string, 10) || 0,
        }

        this.error = ''
        this.loading = true

        try {
            const signedMessage = await this.rpcStore.rpc.prepareDeploymentMessage(this.address!, params, keyPassword)

            this.sendMessage({ signedMessage, info: { type: 'deploy', data: undefined }})
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

    public onNext(data: MultisigData): void {
        this.multisigData = data
        this.step.setDeployMessage()
    }

}

export enum Step {
    EnterData,
    DeployMessage,
}
