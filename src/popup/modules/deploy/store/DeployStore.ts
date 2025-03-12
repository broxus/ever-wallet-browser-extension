import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, LocalizationStore, Logger, RpcStore, Utils } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { DeployMessageToPrepare, WalletMessageToSend } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'
import { prepareKey } from '@app/popup/utils'

@singleton() // singleton due to separate window (change to injectable + child container in other case)
export class DeployStore {

    public account: nt.AssetsList | undefined

    public multisigData: MultisigData | undefined

    public fees = ''

    public custodians: string[] | undefined

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private contactsStore: ContactsStore,
        private localization: LocalizationStore,
        private ledger: LedgerUtils,
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
            this.account = this.accountability.selectedAccount
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
        return this.account?.tonWallet
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

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public async submitPassword(password?: string): Promise<void> {
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
                decimals: this.connectionStore.decimals,
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

        const isValid = await this.utils.checkPassword(keyPassword)
        if (!isValid) {
            throw new Error(
                this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' }),
            )
        }

        const signedMessage = await this.rpcStore.rpc.prepareDeploymentMessage(this.address!, params, keyPassword)
        this.sendMessage({ signedMessage, info: { type: 'deploy', data: undefined }})

        runInAction(() => {
            this.custodians = params.custodians
        })
    }

    public async submitMultisigData(data: MultisigData): Promise<void> {
        this.multisigData = data

        await this.contactsStore.addRecentContacts(
            data.custodians.map((value) => ({ type: 'public_key', value })),
        )
    }

    private sendMessage(message: WalletMessageToSend): void {
        this.rpcStore.rpc.sendMessage(this.address!, message).catch(this.logger.error)
    }

}

export interface MultisigData {
    custodians: string[];
    reqConfirms: number;
    expirationTime: number;
}
