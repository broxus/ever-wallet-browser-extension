import type nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStep, AccountabilityStore, RpcStore } from '@app/popup/modules/shared'

@injectable()
export class SeedDropdownMenuViewModel {

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get selectedMasterKey(): string | undefined {
        return this.accountability.selectedMasterKey
    }

    public async selectMasterKey(key: nt.KeyStoreEntry): Promise<void> {
        const accounts = this.accountability.getAccountsByMasterKey(key.masterKey)
        const account = accounts.find(
            ({ tonWallet }) => this.accountability.accountsVisibility[tonWallet.address],
        ) ?? accounts.at(0)

        if (!account) {
            this.accountability.setCurrentMasterKey(key)
            this.accountability.setStep(AccountabilityStep.MANAGE_SEED)
        }
        else {
            await this.rpcStore.rpc.selectMasterKey(key.masterKey)
            await this.rpcStore.rpc.selectAccount(account.tonWallet.address)
        }
    }

    public addKey(key: nt.KeyStoreEntry): void {
        this.accountability.setCurrentMasterKey(key)
        this.accountability.setStep(AccountabilityStep.CREATE_DERIVED_KEY)
    }

}
