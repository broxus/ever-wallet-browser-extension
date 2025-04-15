import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { AccountabilityStore, LocalizationStore, Logger, NekotonToken, Router, RpcStore } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { isNativeAddress } from '@app/shared'
import { parseError } from '@app/popup/utils'

export interface AddExternalFormValue {
    name: string;
    address: string;
}

@injectable()
export class AddExternalAccountViewModel {

    public loading = false

    public error = ''

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private contactsStore: ContactsStore,
        private logger: Logger,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async onSubmit(value: AddExternalFormValue): Promise<void> {
        try {
            runInAction(() => {
                this.loading = true
                this.error = ''
            })
            const publicKeys = Array.from(Object.values(this.accountability.storedKeys).reduce((acc, item) => {
                if (item === undefined) return acc
                acc.add(item.publicKey)
                return acc
            }, new Set<string>()))

            let address: string | null = null
            for (let i = 0; i < publicKeys.length; i++) {
                address = await this.checkPublicKey(publicKeys[i], value)
                if (address) break
            }

            if (address) {
                this.router.navigate(`/success/${address}`)
            }
            else {
                throw new Error(this.localization.intl.formatMessage({
                    id: 'CREATE_ACCOUNT_PANEL_NOT_CUSTODIAN_ERROR',
                }))
            }
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

    public async checkPublicKey(currentPublicKey: string, value: AddExternalFormValue): Promise<string | null> {
        const { accountEntries } = this.accountability
        let address: string | null = value.address

        if (!this.nekoton.checkAddress(address) && !isNativeAddress(address)) {
            address = await this.contactsStore.resolveDensPath(address)

            if (!address) {
                throw new Error(this.localization.intl.formatMessage({
                    id: 'ERROR_INVALID_ADDRESS',
                }))
            }
        }

        const data = await this.rpcStore.rpc.getEverWalletInitData(address)
        const { publicKey, contractType, workchain, custodians } = data

        if (publicKey === currentPublicKey) {
            const currentDerivedKeyAccounts = Object.values(accountEntries)
                .filter(entry => entry !== undefined && entry.tonWallet.publicKey === currentPublicKey)

            const hasAccount = currentDerivedKeyAccounts
                .some(account => account !== undefined && account.tonWallet.address === address)

            if (hasAccount) {
                throw new Error(this.localization.intl.formatMessage({
                    id: 'CREATE_ACCOUNT_PANEL_ACCOUNT_EXISTS_ERROR',
                }))
            }

            await this.rpcStore.rpc.createAccount({
                contractType,
                publicKey,
                workchain,
                name: value.name,
                explicitAddress: address,
            }, false)

            this.logger.log('[CreateAccountViewModel] address not found in derived key -> create')
            return address
        }

        if (custodians.includes(currentPublicKey)) {
            const existingAccount = accountEntries[address] as nt.AssetsList | undefined

            if (existingAccount) {
                await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)
                await this.rpcStore.rpc.updateAccountVisibility(address, true)
                this.logger.log('[CreateAccountViewModel] add to externals')
                return address
            }

            await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)
            await this.rpcStore.rpc.createAccount({
                contractType,
                publicKey,
                workchain,
                name: value.name,
                explicitAddress: address,
            }, false)

            this.logger.log('[CreateAccountViewModel] create and add account to externals')
            return address
        }

        return null
    }

}
