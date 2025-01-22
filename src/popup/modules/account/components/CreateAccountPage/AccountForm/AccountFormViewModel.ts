import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { inject, injectable } from 'tsyringe'

import { AccountabilityStore, ConnectionStore, LocalizationStore, NekotonToken, NotificationStore, Router, RpcStore } from '@app/popup/modules/shared'
import { ContractEntry, getDefaultWalletContracts, getOtherWalletContracts } from '@app/shared'
import { NetworkType, type Nekoton } from '@app/models'
import { CreateAccountStore, PublicKey } from '@app/popup/modules/account/components/CreateAccountPage/CreateAccountStore'
import { parseError } from '@app/popup/utils'

@injectable()
export class AccountFormViewModel {

    public loading = false

    public publicKey: PublicKey | null = null

    public defaultAccountName = ''


    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        @inject(NekotonToken) private nekoton: Nekoton,
        private createAccount: CreateAccountStore,
        private notification: NotificationStore,
        private connectionStore: ConnectionStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async syncDefaultAccountName(contractType: nt.ContractType): Promise<void> {
        let accountId: number
        let number: number
        try {
            const publicKey = await this.createAccount.getAvailablePublicKey(contractType)
            const accounts = this.createAccount.accountsByKey[publicKey.publicKey]
            accountId = publicKey.index + 1
            number = (accounts?.length ?? 0) + 1
        }
        catch (e) {
            console.error(e)
            accountId = 1
            number = 1
        }
        runInAction(() => {
            this.defaultAccountName = this.localization.intl.formatMessage(
                { id: 'ACCOUNT_GENERATED_NAME' },
                { accountId, number },
            )
        })
    }

    public get selectedConnectionNetworkType(): NetworkType {
        return this.connectionStore.selectedConnectionNetworkType
    }

    public get defaultContracts(): ContractEntry[] {
        return getDefaultWalletContracts(
            this.connectionStore.selectedConnectionNetworkType,
        )
    }

    public get otherContracts(): ContractEntry[] {
        return this.connectionStore.selectedConnectionNetworkType === 'everscale'
            ? getOtherWalletContracts(
                this.connectionStore.selectedConnectionNetworkType,
            )
            : []
    }

    public async onSubmit(contractType: nt.ContractType, name: string): Promise<void> {
        if (this.loading) return
        this.loading = true
        const masterKey = this.createAccount.masterKey

        try {
            await when(() => !!this.defaultAccountName, {
                timeout: 3000,
            })

            const publicKey = await this.createAccount.getAvailablePublicKey(contractType)

            if (!masterKey) {
                throw new Error('createAccount.masterKey must be defined')
            }

            const hasDerivedKey = (this.accountability.keysByMasterKey[masterKey.masterKey] ?? [])
                .some(item => item.publicKey === publicKey.publicKey)

            if (!hasDerivedKey) {
                if (masterKey.signerName === 'ledger_key') {
                    await this.rpcStore.rpc.createLedgerKey({ accountId: publicKey.index })
                }
                else {
                    await this.rpcStore.rpc.createDerivedKey({
                        accountId: publicKey.index,
                        masterKey: masterKey.masterKey,
                        password: this.createAccount.password,
                    })
                }
            }

            const account = await this.rpcStore.rpc.createAccount({
                contractType,
                name: name || this.defaultAccountName,
                publicKey: publicKey.publicKey,
                workchain: 0,
            })
            this.router.navigate(`/success/${account.tonWallet.address}`)
        }
        catch (e: any) {
            this.notification.error(parseError(e))
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
