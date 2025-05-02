import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { inject, singleton } from 'tsyringe'

import type { Contact, DensContact, Nekoton, RawContact } from '@app/models'
import { AccountabilityStore, Logger, NekotonToken, RpcStore } from '@app/popup/modules/shared'
import { isNativeAddress, NetworkGroup } from '@app/shared'

@singleton()
export class ContactsStore {

    private cache = new Map<string, string | null>()

    public lastRemovedContact: Contact | undefined

    public lastAddedContact: Contact | undefined

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
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

        autorun(() => {
            if (this.accountability.currentAccountAddress && this.connectionGroup) {
                this.refreshDensContacts(this.accountability.currentAccountAddress).catch(this.logger.error)
            }
        })
    }

    public get recentContacts(): RawContact[] {
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

    public async resolveAddress(address: string): Promise<{ address: string | null, densPath?: string }> {
        if (this.nekoton.checkAddress(address)) {
            return { address: this.nekoton.repackAddress(address) }
        }

        if (!isNativeAddress(address)) {
            const resolved = await this.resolveDensPath(address)

            if (resolved) {
                return {
                    address: this.nekoton.repackAddress(resolved),
                    densPath: address,
                }
            }
        }

        return { address: null }
    }

    public addRecentContacts(contacts: RawContact[]): Promise<void> {
        return this.rpcStore.rpc.addRecentContacts(contacts)
    }

    public removeRecentContact(value: string): Promise<void> {
        return this.rpcStore.rpc.removeRecentContact(value)
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

    public async removeContact(value: string): Promise<void> {
        const contact = this.contacts[value]

        await this.rpcStore.rpc.removeContact(value)

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

    public checkAddress(address: string): boolean {
        return this.nekoton.checkAddress(address)
    }

    public tryRepackAddress(address: string): string | null {
        try {
            return this.nekoton.repackAddress(address)
        }
        catch {
            return null
        }
    }

}
