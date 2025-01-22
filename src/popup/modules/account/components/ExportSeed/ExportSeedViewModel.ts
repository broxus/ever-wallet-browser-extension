import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { LocalizationStore, RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared'

@injectable()
export class ExportSeedViewModel {

    public keyEntry!: nt.KeyStoreEntry

    public step = Step.PasswordRequest

    public loading = false

    public error = ''

    public seedPhrase: string[] = []

    constructor(
        public handle: SlidingPanelHandle,
        private rpcStore: RpcStore,
        private localization: LocalizationStore,
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
                this.step = Step.CopySeedPhrase
            })
        }
        catch (e) {
            runInAction(() => {
                this.error = this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' })
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
