import type nt from '@wallet/nekoton-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import { AccountabilityStore, createEnumField, RpcStore } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

@injectable()
export class ExportSeedViewModel {

    public step = createEnumField(Step, Step.PasswordRequest)

    public loading = false

    public error = ''

    public seedPhrase: string[] = []

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<ExportSeedViewModel, any>(this, {
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

    public async onSubmit({ password }: { password: string }): Promise<void> {
        if (!this.accountability.currentMasterKey) return

        this.loading = true

        try {
            const exportKey = this.prepareExportKey(this.accountability.currentMasterKey, password)
            const { phrase } = await this.rpcStore.rpc.exportMasterKey(exportKey)

            runInAction(() => {
                this.seedPhrase = phrase.split(' ')
                this.step.setCopySeedPhrase()
            })
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

    private prepareExportKey(entry: nt.KeyStoreEntry, password: string): nt.ExportKey {
        switch (entry.signerName) {
            case 'encrypted_key':
                return {
                    type: entry.signerName,
                    data: {
                        publicKey: entry.publicKey,
                        password,
                    },
                } as nt.ExportKey
            case 'master_key':
                return {
                    type: entry.signerName,
                    data: {
                        masterKey: entry.masterKey,
                        password,
                    },
                } as nt.ExportKey

            case 'ledger_key':
            default:
                throw new Error(`[ExportSeedViewModel] Unsupported operation: ${entry.signerName}`)
        }
    }

}

export enum Step {
    PasswordRequest,
    CopySeedPhrase,
}
