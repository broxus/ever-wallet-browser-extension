import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { parseError } from '@app/popup/utils'
import { createEnumField, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'

@injectable()
export class ExportSeedViewModel {

    public keyEntry!: nt.KeyStoreEntry

    public step = createEnumField<typeof Step>(Step.PasswordRequest)

    public loading = false

    public error = ''

    public seedPhrase: string[] = []

    constructor(
        public handle: SlidingPanelHandle,
        private rpcStore: RpcStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get masterKey(): string {
        return this.keyEntry.masterKey
    }

    public async onSubmit({ password }: { password: string }): Promise<void> {
        this.loading = true

        try {
            const exportSeed = this.prepareExportSeed(this.keyEntry, password)
            const { phrase } = await this.rpcStore.rpc.exportSeed(exportSeed)

            runInAction(() => {
                this.seedPhrase = phrase.split(' ')
                this.step.setValue(Step.CopySeedPhrase)
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

    private prepareExportSeed(entry: nt.KeyStoreEntry, password: string): nt.ExportSeed {
        switch (entry.signerName) {
            case 'encrypted_key':
                return {
                    type: entry.signerName,
                    data: {
                        publicKey: entry.publicKey,
                        password,
                    },
                } as nt.ExportSeed
            case 'master_key':
                return {
                    type: entry.signerName,
                    data: {
                        masterKey: entry.masterKey,
                        password,
                    },
                } as nt.ExportSeed

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
