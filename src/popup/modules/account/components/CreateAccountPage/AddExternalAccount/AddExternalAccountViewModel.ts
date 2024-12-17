import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { AccountabilityStore, LocalizationStore, Logger, NekotonToken, RpcStore } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { CreateAccountStore } from '@app/popup/modules/account/components/CreateAccountPage/CreateAccountStore'

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
        private createAccount: CreateAccountStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    // public async onSubmit(value: AddExternalFormValue): Promise<void> {
    public async onSubmit(): Promise<void> {
        // if (this.loading) return
        // this.loading = true

        // try {
        //     const { currentDerivedKey } = this
        //     const { currentDerivedKeyAccounts, accountEntries } = this.accountability
        //     let address: string | null = value.address

        //     if (!this.nekoton.checkAddress(address) && !isNativeAddress(address)) {
        //         address = await this.contactsStore.resolveDensPath(address)

        //         if (!address) {
        //             runInAction(() => {
        //                 this.error = this.localization.intl.formatMessage({
        //                     id: 'ERROR_INVALID_ADDRESS',
        //                 })
        //             })
        //             return
        //         }
        //     }

        //     const data = await this.rpcStore.rpc.getEverWalletInitData(address)
        //     const { publicKey, contractType, workchain, custodians } = data

        //     const currentPublicKey = currentDerivedKey.publicKey

        //     if (publicKey === currentPublicKey) {
        //         const hasAccount = currentDerivedKeyAccounts.some(
        //             account => account.tonWallet.address === address,
        //         )

        //         if (!hasAccount) {
        //             await this.rpcStore.rpc.createAccount({
        //                 contractType,
        //                 publicKey,
        //                 workchain,
        //                 name: value.name,
        //                 explicitAddress: address,
        //             })

        //             await this.accountability.selectAccount(address)
        //             // this.handle.close()
        //             this.logger.log('[CreateAccountViewModel] address not found in derived key -> create')
        //         }
        //         else {
        //             runInAction(() => {
        //                 this.error = this.localization.intl.formatMessage({
        //                     id: 'CREATE_ACCOUNT_PANEL_ACCOUNT_EXISTS_ERROR',
        //                 })
        //             })
        //         }
        //     }
        //     else if (custodians.includes(currentPublicKey)) {
        //         const existingAccount = accountEntries[address] as nt.AssetsList | undefined

        //         if (!existingAccount) {
        //             await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)
        //             await this.rpcStore.rpc.createAccount({
        //                 contractType,
        //                 publicKey,
        //                 workchain,
        //                 name: value.name,
        //                 explicitAddress: address,
        //             })

        //             this.logger.log('[CreateAccountViewModel] create and add account to externals')
        //         }
        //         else {
        //             await this.rpcStore.rpc.addExternalAccount(address, publicKey, currentPublicKey)
        //             await this.rpcStore.rpc.updateAccountVisibility(address, true)

        //             this.logger.log('[CreateAccountViewModel] add to externals')
        //         }

        //         await this.accountability.selectAccount(address)
        //         // this.handle.close()
        //     }
        //     else {
        //         runInAction(() => {
        //             this.error = this.localization.intl.formatMessage({
        //                 id: 'CREATE_ACCOUNT_PANEL_NOT_CUSTODIAN_ERROR',
        //             })
        //         })
        //     }
        // }
        // catch (e: any) {
        //     runInAction(() => {
        //         this.error = parseError(e)
        //     })
        // }
        // finally {
        //     runInAction(() => {
        //         this.loading = false
        //     })
        // }
    }

}
