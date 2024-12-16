import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { LocalizationStore, NotificationStore, Router, RpcStore } from '@app/popup/modules/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { closeCurrentWindow } from '@app/shared'
import { CreateAccountStore } from '@app/popup/modules/account/components/CreateAccountPage/CreateAccountStore'
import { parseError } from '@app/popup/utils'

@injectable()
export class SeedSelectViewModel {

    public loading = false

    public error = ''

    constructor(
        private rpcStore: RpcStore,
        private ledger: LedgerUtils,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private createAccount: CreateAccountStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get masterKeys(): nt.KeyStoreEntry[] {
        return this.createAccount.masterKeys
    }

    public get masterKey(): nt.KeyStoreEntry | undefined {
        return this.createAccount.masterKey
    }

    public get keyIndex(): number {
        return this.createAccount.keyIndex
    }

    public resetError() {
        this.error = ''
    }

    public setSeedIndex(index: number) {
        this.createAccount.setKeyIndex(index)
    }

    public async submitPassword(password: string): Promise<void> {
        if (this.loading || !this.masterKey) return
        this.loading = true

        try {
            try {
                await this.rpcStore.rpc.getPublicKeys({
                    type: 'master_key',
                    data: {
                        password,
                        offset: 0,
                        limit: 1,
                        masterKey: this.masterKey.masterKey,
                    },
                })
            }
            catch (e: any) {
                throw new Error(this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' }))
            }
            this.createAccount.setPassword(password)
            await this.createAccount.syncAvailablePublicKey()
            this.router.navigate(`/create/${this.keyIndex}/account`)
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

    public async submitLedger(): Promise<void> {
        if (this.loading || !this.masterKey) return
        this.loading = true

        try {
            const connected = await this.ledger.checkLedger()
            if (!connected) {
                await this.connectLedger()
                return
            }

            const found = await this.ledger.checkLedgerMasterKey(this.masterKey)
            if (!found) {
                this.notification.error(this.localization.intl.formatMessage({ id: 'ERROR_LEDGER_KEY_NOT_FOUND' }))
                return
            }

            await this.createAccount.syncAvailablePublicKey()
            this.router.navigate(`/create/${this.keyIndex}/account`)
        }
        catch (e: any) {
            console.error(e)
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private async connectLedger(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInBrowser({
            route: 'ledger',
            force: true,
        })
        await closeCurrentWindow()
    }

}
