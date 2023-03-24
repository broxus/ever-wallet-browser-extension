import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStep, AccountabilityStore, NotificationStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class ManageDerivedKeyViewModel {

    constructor(
        public notification: NotificationStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get currentDerivedKey(): nt.KeyStoreEntry {
        return this.accountability.currentDerivedKey!
    }

    public get accountsVisibility(): Record<string, boolean> {
        return this.accountability.accountsVisibility
    }

    public get selectedAccountAddress(): string | undefined {
        return this.accountability.selectedAccountAddress
    }

    public get accounts(): nt.AssetsList[] {
        const { currentDerivedKeyAccounts, currentDerivedKeyExternalAccounts } = this.accountability

        return currentDerivedKeyAccounts
            .concat(currentDerivedKeyExternalAccounts)
            .sort((a, b) => a.name.localeCompare(b.name))
    }

    public get isLast(): boolean {
        return this.accountability.keysByMasterKey[this.currentDerivedKey.masterKey].length === 1
    }

    public addAccount(): void {
        this.accountability.setStep(AccountabilityStep.CREATE_ACCOUNT)
    }

    public onManageAccount(account: nt.AssetsList): void {
        this.accountability.onManageAccount(account)
    }

    public async onChangeVisibility(account: nt.AssetsList): Promise<void> {
        const address = account.tonWallet.address
        await this.rpcStore.rpc.updateAccountVisibility(address, !this.accountsVisibility[address])
    }

    public async onDelete(): Promise<void> {
        const { currentDerivedKeyAccounts, selectedAccountAddress } = this.accountability
        const accountsToRemove = currentDerivedKeyAccounts.map(({ tonWallet: { address }}) => address)

        await this.rpcStore.rpc.removeAccounts(accountsToRemove)
        await this.rpcStore.rpc.removeKey({ publicKey: this.currentDerivedKey.publicKey })

        if (selectedAccountAddress && accountsToRemove.includes(selectedAccountAddress)) {
            await this.rpcStore.rpc.selectFirstAccount()
        }

        this.accountability.setStep(AccountabilityStep.MANAGE_SEED)
        this.accountability.setCurrentDerivedKey(undefined)
    }

    public onBack(): void {
        this.accountability.setStep(AccountabilityStep.MANAGE_SEED)
        this.accountability.setCurrentDerivedKey(undefined)
    }

    public filter(list: nt.AssetsList[], search: string): nt.AssetsList[] {
        return list.filter((account) => account.name.toLowerCase().includes(search))
    }

}
