import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { supportedByLedger } from '@app/shared'
import { AccountabilityStore, Router, SlidingPanelHandle } from '@app/popup/modules/shared'
import { DensContact } from '@app/models'
import { ContactsStore } from '@app/popup/modules/contacts'

@injectable()
export class ReceiveViewModel {

    public address!: string

    constructor(
        private router: Router,
        private accountability: AccountabilityStore,
        private contactsStore: ContactsStore,
        private handle: SlidingPanelHandle,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get account(): nt.AssetsList {
        return this.accountability.accountEntries[this.address]
    }

    public get key(): nt.KeyStoreEntry {
        return this.accountability.storedKeys[this.account.tonWallet.publicKey]
    }

    public get canVerify(): boolean {
        return this.key.signerName === 'ledger_key' && supportedByLedger(this.account.tonWallet.contractType)
    }

    public get densContacts(): DensContact[] {
        return this.contactsStore.densContacts[this.address] ?? []
    }

    public onVerify(): void {
        this.handle.close()
        // TODO: ledger
        // this.router.navigate(`/ledger/verify/${this.address}`)
    }

}
