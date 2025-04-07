import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, Router, RpcStore, SlidingPanelStore } from '@app/popup/modules/shared'

import { AddAccountFlow } from '../../models'

@injectable()
export class ManageDerivedKeyViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get currentDerivedKey(): nt.KeyStoreEntry | undefined {
        return this.accountability.currentDerivedKey
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

    public get canDelete(): boolean {
        if (!this.currentDerivedKey) return true
        if (this.currentDerivedKey.masterKey === this.accountability.selectedAccountPublicKey) return false
        return this.accountability.keysByMasterKey[this.currentDerivedKey.masterKey]?.length !== 1
    }

    public addAccount(flow: AddAccountFlow): void {
        this.router.navigate(`add-account/${flow}`)
    }

    public onManageAccount(account: nt.AssetsList): void {
        this.accountability.onManageAccount(account)
        this.router.navigate('../account')
    }

    public async onChangeVisibility(account: nt.AssetsList): Promise<void> {
        const address = account.tonWallet.address
        await this.rpcStore.rpc.updateAccountVisibility(address, !this.accountsVisibility[address])
    }

    public onKeyDeleted(): void {
        this.router.navigate('../seed')
    }

    public filter(list: nt.AssetsList[], search: string): nt.AssetsList[] {
        return list.filter((account) => account.name.toLowerCase().includes(search))
    }

}
