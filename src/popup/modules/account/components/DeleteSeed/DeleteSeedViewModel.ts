import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class DeleteSeedViewModel {

    public onDelete!: () => void

    public error = ''

    public loading = false

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<DeleteSeedViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
        }, { autoBind: true })
    }

    public get name(): string {
        const key = this.accountability.currentMasterKey
        if (!key) return ''
        return this.accountability.masterKeysNames[key.masterKey] ?? convertPublicKey(key.masterKey)
    }

    public get derivedKeys(): nt.KeyStoreEntry[] {
        return this.accountability.derivedKeys
            .sort((a, b) => a.accountId - b.accountId)
    }

    public get accountsByPublicKey(): Record<string, number> {
        return Object.values(this.accountability.accountEntries).reduce((result, account) => {
            if (!result[account.tonWallet.publicKey]) {
                result[account.tonWallet.publicKey] = 0
            }
            result[account.tonWallet.publicKey] += 1
            return result
        }, {} as Record<string, number>)
    }

    public async deleteSeed(): Promise<void> {
        if (this.loading || !this.accountability.currentMasterKey) return

        this.loading = true

        try {
            await this.rpcStore.rpc.removeMasterKey(this.accountability.currentMasterKey.masterKey)
            this.onDelete()
        }
        catch (e) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}
