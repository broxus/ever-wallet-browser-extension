import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction, when } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import {
    AccountabilityStore,
    ConnectionStore,
    LocalizationStore,
    Logger,
    NekotonToken,
    Router,
    RpcStore,
} from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'
import { getWalletContracts, isNativeAddress, NetworkGroup } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

import { AddAccountFlow } from '../../models'
import type { ImportAccountFormValue } from './components'
import { CreateAccountFormValue } from './components'

@injectable()
export class AddAccountViewModel {

    public readonly flow: AddAccountFlow

    public loading = false

    public error = ''

    constructor(
        private router: Router,
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private contactsStore: ContactsStore,
        public connectionStore: ConnectionStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        this.flow = router.state.matches.at(-1)!.params.flow as AddAccountFlow
    }

    public get defaultAccountName() {
        const accountId = this.accountability.currentDerivedKey?.accountId || 0
        const number = this.accountability.currentDerivedKeyAccounts.length
        return this.localization.intl.formatMessage(
            { id: 'ACCOUNT_GENERATED_NAME' },
            { accountId: accountId + 1, number: number + 1 },
        )
    }

    public get networkGroup(): NetworkGroup {
        return this.connectionStore.selectedConnectionNetworkGroup
    }

    public get availableContracts(): nt.ContractType[] {
        const { currentDerivedKey } = this.accountability
        const contracts = getWalletContracts(
            this.connectionStore.selectedConnectionNetworkGroup,
            this.connectionStore.connectionConfig,
        )
        const contractsTypes = contracts.map(item => item.type)

        if (!currentDerivedKey) {
            return contractsTypes
        }

        const accountAddresses = new Set(
            this.accountability.currentDerivedKeyAccounts.map(
                account => account.tonWallet.address,
            ),
        )

        return contractsTypes.filter(type => {
            const address = this.nekoton.computeTonWalletAddress(currentDerivedKey.publicKey, type, 0)
            return !accountAddresses.has(address)
        })
    }

    public async createAccount({ name, contractType }: CreateAccountFormValue): Promise<void> {
        if (!this.accountability.currentDerivedKey || this.loading) return

        this.loading = true

        try {
            const account = await this.rpcStore.rpc.createAccount({
                contractType,
                name,
                publicKey: this.accountability.currentDerivedKey.publicKey,
                workchain: 0,
            }, false)

            if (account) {
                this.router.navigate(`/success/account/${account.tonWallet.address}`)
            }
        }
        catch (e: any) {
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

    public async importAccount({ name, address: rawAddress }: ImportAccountFormValue): Promise<void> {
        if (!this.accountability.currentDerivedKey) return

        this.loading = true

        try {
            const { currentDerivedKey, currentDerivedKeyAccounts, accountEntries } = this.accountability
            let address: string | null = rawAddress

            if (!this.nekoton.checkAddress(address) && !isNativeAddress(address)) {
                address = await this.contactsStore.resolveDensPath(address)

                if (!address) {
                    runInAction(() => {
                        this.error = this.localization.intl.formatMessage({
                            id: 'ERROR_INVALID_ADDRESS',
                        })
                    })
                    return
                }
            }

            const data = await this.rpcStore.rpc.getEverWalletInitData(address)
            const { publicKey, contractType, workchain, custodians } = data

            const currentPublicKey = currentDerivedKey.publicKey

            if (publicKey === currentPublicKey) {
                const hasAccount = currentDerivedKeyAccounts.some(
                    account => account.tonWallet.address === address,
                )

                if (!hasAccount) {
                    await this.manageAccount(
                        await this.rpcStore.rpc.createAccount({
                            contractType,
                            publicKey,
                            workchain,
                            name,
                            explicitAddress: address,
                        }, false),
                    )

                    this.logger.log('[CreateAccountViewModel] address not found in derived key -> create')
                }
                else {
                    runInAction(() => {
                        this.error = this.localization.intl.formatMessage({
                            id: 'CREATE_ACCOUNT_PANEL_ACCOUNT_EXISTS_ERROR',
                        })
                    })
                }
            }
            else if (custodians.includes(currentPublicKey)) {
                const existingAccount = accountEntries[address] as nt.AssetsList | undefined

                if (!existingAccount) {
                    await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)

                    await this.manageAccount(
                        await this.rpcStore.rpc.createAccount({
                            contractType,
                            publicKey,
                            workchain,
                            name,
                            explicitAddress: address,
                        }, false),
                    )

                    this.logger.log('[CreateAccountViewModel] create and add account to externals')
                }
                else {
                    await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)
                    await this.rpcStore.rpc.updateAccountVisibility(address, true)

                    await this.manageAccount(existingAccount)

                    this.logger.log('[CreateAccountViewModel] add to externals')
                }
            }
            else {
                runInAction(() => {
                    this.error = this.localization.intl.formatMessage({
                        id: 'CREATE_ACCOUNT_PANEL_NOT_CUSTODIAN_ERROR',
                    })
                })
            }
        }
        catch (e: any) {
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

    private async manageAccount(account: nt.AssetsList) {
        // prevent white screen while waiting for state to update
        await when(() => !!this.rpcStore.state.accountEntries[account.tonWallet.address])

        this.accountability.onManageAccount(account)
        await this.router.navigate(`/success/account/${account.tonWallet.address}`)
    }

}
