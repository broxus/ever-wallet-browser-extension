import { Address } from 'everscale-inpage-provider'

import { DENS_ROOT_ADDRESS_CONFIG } from '@app/shared'
import { DensDomainAbi, DensRootAbi } from '@app/abi'
import { Contact, DensContact, NetworkGroup } from '@app/models'

import { BaseConfig, BaseController, BaseState } from './BaseController'
import { ConnectionController } from './ConnectionController'
import { ContractFactory } from '../utils/Contract'
import { Deserializers, Storage } from '../utils/Storage'

interface ContactsControllerConfig extends BaseConfig {
    connectionController: ConnectionController;
    contractFactory: ContractFactory;
    storage: Storage<ContactsStorage>;
}

interface ContactsControllerState extends BaseState {
    contacts: Record<NetworkGroup, Record<string, Contact>>; // address -> Contact
    densContacts: Record<NetworkGroup, Record<string, DensContact[]>>; // account -> DensContact[]
    recentContacts: string[],
}

function makeDefaultState(): ContactsControllerState {
    return {
        contacts: {},
        densContacts: {},
        recentContacts: [],
    }
}

const MAX_RECENT = 5

export class ContactsController extends BaseController<ContactsControllerConfig, ContactsControllerState> {

    constructor(config: ContactsControllerConfig, state?: ContactsControllerState) {
        super(config, state || makeDefaultState())
        this.initialize()
    }

    public initialSync() {
        const { storage } = this.config
        const contacts = storage.snapshot.contacts ?? {}
        const densContacts = storage.snapshot.densContacts ?? {}
        const recentContacts = storage.snapshot.recentContacts ?? []

        this.update({
            contacts,
            densContacts,
            recentContacts,
        })
    }

    public async resolveDensPath(path: string): Promise<string | null> {
        const { connectionController, contractFactory } = this.config
        const { selectedConnection } = connectionController.state
        const densRootAddress = DENS_ROOT_ADDRESS_CONFIG[selectedConnection.group]

        if (!densRootAddress) return null

        try {
            const densRoot = contractFactory.create(DensRootAbi, densRootAddress)
            const { certificate } = await densRoot.call('resolve', {
                path,
                answerId: 0,
            })
            const domain = await contractFactory.create(DensDomainAbi, certificate.toString())
            const { target } = await domain.call('resolve', { answerId: 0 })

            return target.toString()
        }
        catch {}

        return null
    }

    public async refreshDensContacts(target: string): Promise<void> {
        try {
            const { connectionController, contractFactory } = this.config
            const { selectedConnection } = connectionController.state

            const current = new Map<string, DensContact>(
                this.state.densContacts[selectedConnection.group]?.[target]?.map(
                    (contact) => [contact.contract, contact],
                ),
            )
            const contracts = await this._getDensContracts(target)

            const contacts = await Promise.all(contracts.map(async (contract) => {
                let contact = current.get(contract)

                if (!contact) {
                    const domain = await contractFactory.create(DensDomainAbi, contract)
                    const { path } = await domain.call('getPath', { answerId: 0 })

                    contact = { contract, path, target }
                }

                return contact
            }))

            this.update({
                densContacts: {
                    ...this.state.densContacts,
                    [selectedConnection.group]: {
                        ...this.state.densContacts[selectedConnection.group],
                        [target]: contacts,
                    },
                },
            })

            await this._saveDensContacts()
        }
        catch (e) {
            console.error(e)
        }
    }

    public async addContact(contact: Contact): Promise<void> {
        const { connectionController } = this.config
        const { contacts } = this.state
        const { selectedConnection } = connectionController.state

        this.update({
            contacts: {
                ...contacts,
                [selectedConnection.group]: {
                    ...contacts[selectedConnection.group],
                    [contact.address]: contact,
                },
            }
        })

        await this._saveContacts()
    }

    public async removeContact(address: string): Promise<void> {
        const { connectionController } = this.config
        const { contacts } = this.state
        const { selectedConnection } = connectionController.state

        delete contacts[selectedConnection.group]?.[address]

        this.update({ contacts })

        await this._saveContacts()
    }

    public async addRecentContact(address: string): Promise<void> {
        const recentContacts = [address, ...this.state.recentContacts]
        const i = recentContacts.indexOf(address, 1)

        if (i !== -1) {
            recentContacts.splice(i, 1)
        }

        recentContacts.splice(MAX_RECENT)

        this.update({ recentContacts })

        await this._saveRecentContacts()
    }

    public async removeRecentContact(address: string): Promise<void> {
        const i = this.state.recentContacts.indexOf(address)

        if (i === -1) return

        const recentContacts = [...this.state.recentContacts]
        recentContacts.splice(i, 1)

        this.update({ recentContacts })

        await this._saveRecentContacts()
    }

    // DensRoot.expectedCertificateCodeHash()
    // sid=1 - domain
    // sid=2 - subdomains
    private _getDensContracts(address: string): Promise<string[]> {
        const { connectionController, contractFactory } = this.config
        const { selectedConnection } = connectionController.state
        const densRootAddress = DENS_ROOT_ADDRESS_CONFIG[selectedConnection.group]

        if (!densRootAddress) return Promise.resolve([])

        return connectionController.use(async ({ data: { transport }}) => {
            const densRoot = contractFactory.create(DensRootAbi, densRootAddress)
            const target = new Address(address)
            const contractState = await transport.getFullContractState(densRootAddress)

            const [
                domain,
                subdomain,
            ] = await Promise.all([
                densRoot.call('expectedCertificateCodeHash', { target, answerId: 0, sid: 1 }, contractState),
                densRoot.call('expectedCertificateCodeHash', { target, answerId: 0, sid: 2 }, contractState),
            ])

            const domainCodeHash = BigInt(domain.codeHash).toString(16).padStart(64, '0')
            const subdomainCodeHash = BigInt(subdomain.codeHash).toString(16).padStart(64, '0')

            const [
                domainAccounts,
                subdomainAccounts,
            ] = await Promise.all([
                transport.getAccountsByCodeHash(domainCodeHash, 10),
                transport.getAccountsByCodeHash(subdomainCodeHash, 10),
            ])

            return [...domainAccounts.accounts, ...subdomainAccounts.accounts]
        })
    }

    private _saveContacts(): Promise<void> {
        return this.config.storage.set({ contacts: this.state.contacts })
    }

    private _saveDensContacts(): Promise<void> {
        return this.config.storage.set({ densContacts: this.state.densContacts })
    }

    private _saveRecentContacts(): Promise<void> {
        return this.config.storage.set({ recentContacts: this.state.recentContacts })
    }

}

interface ContactsStorage {
    contacts: ContactsControllerState['contacts'];
    densContacts: ContactsControllerState['densContacts'];
    recentContacts: string[];
}

Storage.register<ContactsStorage>({
    contacts: {
        exportable: true,
        deserialize: Deserializers.object,
        validate: (value: unknown) => !value || typeof value === 'object',
    },
    densContacts: { deserialize: Deserializers.object },
    recentContacts: { deserialize: Deserializers.array },
})
