import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import {
    AccountabilityStep, AccountabilityStore, createEnumField, RpcStore,
} from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

@injectable()
export class CreateDerivedKeyViewModel {

    public step = createEnumField(Step, Step.Password)

    public password = ''

    public publicKeys: PublicKeys = new Map()

    public loading = false

    public passwordError = ''

    public selectKeysError = ''

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<CreateDerivedKeyViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get masterKey(): string {
        return this.accountability.currentMasterKey?.publicKey ?? ''
    }

    public get masterKeysNames(): Record<string, string> {
        return this.accountability.masterKeysNames
    }

    public get masterKeyName(): string {
        return this.masterKeysNames[this.masterKey] || convertPublicKey(this.masterKey)
    }

    public get storedKeys(): Record<string, nt.KeyStoreEntry> {
        return this.accountability.storedKeys
    }

    public get derivedKeys(): nt.KeyStoreEntry[] {
        return this.accountability.derivedKeys
    }

    public get currentMasterKey(): nt.KeyStoreEntry | undefined {
        return this.accountability.currentMasterKey
    }

    public get accounts(): nt.AssetsList[] {
        return this.accountability.accounts
    }

    public get selectedAccount(): nt.AssetsList | undefined {
        return this.accountability.selectedAccount
    }

    public get selectedAccountPublicKey(): string {
        return this.accountability.selectedAccountPublicKey!
    }

    public goToManageSeed(): void {
        return this.accountability.setStep(AccountabilityStep.MANAGE_SEED)
    }

    public async onSubmitPassword(password: string): Promise<void> {
        if (!this.currentMasterKey) return

        this.loading = true

        try {
            const rawPublicKeys = await this.rpcStore.rpc.getPublicKeys({
                type: 'master_key',
                data: {
                    password,
                    offset: 0,
                    limit: PUBLIC_KEYS_LIMIT,
                    masterKey: this.currentMasterKey.masterKey,
                },
            })

            runInAction(() => {
                this.publicKeys = new Map(rawPublicKeys.map((key, i) => [key, i]))
                this.password = password
                this.step.setSelect()
            })
        }
        catch (e: any) {
            runInAction(() => {
                this.passwordError = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public async onSubmitKeys(selectedKeys: PublicKeys): Promise<void> {
        if (!this.currentMasterKey || !this.password) return

        this.loading = true

        const { masterKey } = this.currentMasterKey
        const currentKeysIds = this.derivedKeys.map(({ accountId }) => accountId)
        const selectedKeysIds = [...selectedKeys.values()]
        const keysIdsToCreate = selectedKeysIds.filter(
            accountId => !currentKeysIds.includes(accountId),
        )
        const keyIdsToRemove = currentKeysIds.filter(
            accountId => !selectedKeysIds.includes(accountId),
        )
        const keysToRemove = [...this.publicKeys.entries()]
            .filter(([, accountId]) => keyIdsToRemove.includes(accountId))
            .map(([publicKey]) => publicKey)
        const paramsToCreate = keysIdsToCreate.map(accountId => ({
            accountId,
            masterKey,
            password: this.password,
        }))
        const paramsToRemove = keysToRemove.map(publicKey => ({ publicKey }))
        const accountsToRemove = this.accounts
            .filter(({ tonWallet: { publicKey }}) => keysToRemove.includes(publicKey))
            .map(({ tonWallet: { address }}) => address)

        try {
            if (paramsToCreate.length) {
                const keys = await this.rpcStore.rpc.createDerivedKeys(paramsToCreate)

                for (const key of keys) {
                    await this.accountability.addExistingWallets(key.publicKey)
                }
            }

            if (accountsToRemove.length) {
                await this.rpcStore.rpc.removeAccounts(accountsToRemove)
            }

            if (paramsToRemove.length) {
                await this.rpcStore.rpc.removeKeys(paramsToRemove)
            }
        }
        catch (e: any) {
            runInAction(() => {
                this.selectKeysError = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }

        this.goToManageSeed()
    }

}

const PUBLIC_KEYS_LIMIT = 100

export type PublicKeys = Map<string, number>;

export enum Step {
    Password,
    Select,
}
