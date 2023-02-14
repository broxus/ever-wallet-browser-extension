import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { singleton } from 'tsyringe'

import type { Contact, DensContact, NetworkGroup } from '@app/models'
import { AccountabilityStore, Logger, RpcStore } from '@app/popup/modules/shared'


@singleton()
export class ContactsStore {

    private cache = new Map<string, string | null>()

    public lastRemovedContact: Contact | undefined

    public lastAddedContact: Contact | undefined

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        autorun(() => {
            if (this.accountability.selectedAccountAddress && this.connectionGroup) {
                this.refreshDensContacts(this.accountability.selectedAccountAddress).catch(this.logger.error)
            }
        })
    }

    public get recentContacts(): string[] {
        return this.rpcStore.state.recentContacts
    }

    public get contacts(): Record<string, Contact> {
        return this.rpcStore.state.contacts[this.connectionGroup] ?? {}
    }

    public get densContacts(): Record<string, DensContact[]> {
        return this.rpcStore.state.densContacts[this.connectionGroup] ?? {}
    }

    public get accountDensContacts(): DensContact[] {
        if (!this.accountability.selectedAccountAddress) return []
        return this.densContacts[this.accountability.selectedAccountAddress] ?? []
    }

    private get connectionGroup(): NetworkGroup {
        return this.rpcStore.state.selectedConnection.group
    }

    public async refreshDensContacts(target: string): Promise<void> {
        await this.rpcStore.rpc.refreshDensContacts(target)
    }

    public async resolveDensPath(path: string): Promise<string | null> {
        if (this.cache.has(path)) {
            return this.cache.get(path)!
        }

        const address = await this.rpcStore.rpc.resolveDensPath(path)
        this.cache.set(path, address)

        return address
    }

    public addRecentContact(address: string): Promise<void> {
        return this.rpcStore.rpc.addRecentContact(address)
    }

    public removeRecentContact(address: string): Promise<void> {
        return this.rpcStore.rpc.removeRecentContact(address)
    }

    public async addContact(contact: Contact): Promise<void> {
        await this.rpcStore.rpc.addContact(contact)

        runInAction(() => {
            this.lastAddedContact = contact
        })
    }

    public updateContact(contact: Contact): Promise<void> {
        return this.rpcStore.rpc.addContact(contact)
    }

    public async removeContact(address: string): Promise<void> {
        const contact = this.contacts[address]

        await this.rpcStore.rpc.removeContact(address)

        runInAction(() => {
            this.lastRemovedContact = contact
        })
    }

    public resetLastRemovedContact(): void {
        this.lastRemovedContact = undefined
    }

    public resetLastAddedContact(): void {
        this.lastAddedContact = undefined
    }

}
