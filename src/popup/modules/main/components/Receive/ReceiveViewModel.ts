import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { supportedByLedger } from '@app/shared'
import { AccountabilityStore, SlidingPanelHandle, SlidingPanelStore } from '@app/popup/modules/shared'
import { DensContact } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'

@injectable()
export class ReceiveViewModel {

    public address!: string

    constructor(
        public handle: SlidingPanelHandle,
        public panel: SlidingPanelStore,
        private accountability: AccountabilityStore,
        private contactsStore: ContactsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public close(): void {
        this.handle.close()
    }

    public get account(): nt.AssetsList | undefined {
        return this.accountability.accountEntries[this.address]
    }

    public get key(): nt.KeyStoreEntry | undefined {
        return this.account ? this.accountability.storedKeys[this.account.tonWallet.publicKey] : undefined
    }

    public get canVerify(): boolean {
        return this.account ? this.key?.signerName === 'ledger_key' && supportedByLedger(this.account.tonWallet.contractType) : false
    }

    public get densContacts(): DensContact[] {
        return this.contactsStore.densContacts[this.address] ?? []
    }

}
