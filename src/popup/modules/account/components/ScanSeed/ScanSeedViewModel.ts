import type * as nt from '@broxus/ever-wallet-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

import { LedgerUtils } from '@app/popup/modules/ledger/utils/LedgerUtils';
import {
    AccountabilityStore,
    LocalizationStore,
    NotificationStore,
    RpcStore,
    SlidingPanelHandle,
    Utils,
} from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils/utils';

@injectable()
export class ScanSeedViewModel {
    public loading = false;

    public error = '';

    public ledgerConnect = false;

    constructor(
        public panel: SlidingPanelHandle,
        public ledger: LedgerUtils,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private notification: NotificationStore,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });

        utils.when(
            () => this.keyEntry?.signerName === 'ledger_key',
            async () => {
                const connected = await ledger.checkLedger();
                if (!connected) {
                    runInAction(() => {
                        this.ledgerConnect = true;
                    });
                } else {
                    this.handleLedgerConnected();
                }
            },
        );
    }

    public get keyEntry(): nt.KeyStoreEntry {
        return this.accountability.currentMasterKey!;
    }

    public handleLedgerFailed() {
        this.panel.close();
    }

    public async handleLedgerConnected() {
        try {
            await this.scan(this.accountability.getLedgerKeysToScan(this.keyEntry));
        } catch (e) {
            this.notification.error(parseError(e));
        } finally {
            runInAction(() => {
                this.panel.close();
            });
        }
    }

    public async handleSubmit({ password }: { password: string }) {
        try {
            this.loading = true;

            await this.scan(this.accountability.getKeysToScan(this.keyEntry, password));

            runInAction(() => {
                this.panel.close();
            });
        } catch (_) {
            runInAction(() => {
                this.error = this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' });
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    private async scan(keys: AsyncIterable<nt.KeyStoreEntry>) {
        for await (const key of keys) {
            const isMasterKey = key.masterKey === key.publicKey;
            const accounts = await this.accountability.addExistingWallets(key.publicKey);

            if (!isMasterKey && !accounts.length && !this.accountability.accountsByPublicKey[key.publicKey]) {
                await this.rpcStore.rpc.removeKey({ publicKey: key.publicKey });
                // stop scanning on first empty key
                break;
            }
        }
    }
}
