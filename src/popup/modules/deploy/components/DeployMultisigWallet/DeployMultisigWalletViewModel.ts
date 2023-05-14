import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { DeployMessageToPrepare, WalletMessageToSend } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    createEnumField,
    Logger,
    RpcStore,
    Utils,
} from '@app/popup/modules/shared'
import { parseError, prepareKey } from '@app/popup/utils'
import { closeCurrentWindow, NATIVE_CURRENCY_DECIMALS } from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { ContactsStore } from '@app/popup/modules/contacts'

import { MultisigData } from '../MultisigForm'

@injectable()
export class DeployMultisigWalletViewModel {

    public step = createEnumField<typeof Step>(Step.EnterData)

    public selectedAccount: nt.AssetsList | undefined

    public multisigData: MultisigData | undefined

    public loading = false

    public error = ''

    public fees = ''

    public custodians: string[] | undefined

    constructor(
        public ledger: LedgerUtils,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private contactsStore: ContactsStore,
        private logger: Logger,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.autorun(async () => {
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

        utils.when(() => !!this.accountability.selectedAccount, () => {
            this.selectedAccount = this.accountability.selectedAccount
        })

        utils.when(() => this.selectedDerivedKeyEntry?.signerName === 'ledger_key', async () => {
            const connected = ledger.checkLedger()
            if (!connected) {
                await this.rpcStore.rpc.openExtensionInBrowser({
                    route: 'ledger',
                    force: true,
                })
                window.close()
            }
        })
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

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public async onSubmit(password?: string): Promise<void> {
        if (!this.selectedDerivedKeyEntry || !this.everWalletAsset) {
            throw new Error('Account not selected')
        }

        const keyPassword = prepareKey({
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
        const params: DeployMessageToPrepare = {
            type: 'multiple_owners',
            custodians: this.multisigData?.custodians ?? [],
            reqConfirms: this.multisigData?.reqConfirms ?? 0,
        }

        if (this.everWalletAsset.contractType === 'Multisig2_1' && params.custodians.length > 1) {
            params.expirationTime = (this.multisigData?.expirationTime ?? 24) * 60 * 60 // hours to seconds
        }

        this.error = ''
        this.loading = true

        try {
            const signedMessage = await this.rpcStore.rpc.prepareDeploymentMessage(this.address!, params, keyPassword)
            this.sendMessage({ signedMessage, info: { type: 'deploy', data: undefined }})

            runInAction(() => {
                this.custodians = params.custodians
            })
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

    public async onNext(data: MultisigData): Promise<void> {
        this.multisigData = data
        this.step.setValue(Step.DeployMessage)

        await this.contactsStore.addRecentContacts(
            data.custodians.map((value) => ({ type: 'public_key', value })),
        )
    }

    public async onBack(): Promise<void> {
        await closeCurrentWindow()
    }

    public async onClose(): Promise<void> {
        await closeCurrentWindow()
    }

    private sendMessage(message: WalletMessageToSend): void {
        this.rpcStore.rpc.sendMessage(this.address!, message).catch(this.logger.error)
    }

}

export enum Step {
    EnterData,
    DeployMessage,
}
