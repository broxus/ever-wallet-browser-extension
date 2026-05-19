import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

import { LedgerUtils } from '@app/popup/modules/ledger';
import { Router, Utils } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';

import { DeployStore } from '../../store';

@injectable()
export class ConfirmationPageViewModel {
    public loading = false;

    public error = '';

    public ledgerConnect = false;

    constructor(
        public store: DeployStore,
        public ledger: LedgerUtils,
        private router: Router,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });

        utils.when(
            () => this.store.selectedDerivedKeyEntry?.signerName === 'ledger_key',
            async () => {
                const connected = await ledger.checkLedger();
                if (!connected) {
                    runInAction(() => {
                        this.ledgerConnect = true;
                    });
                }
            },
        );
    }

    public async submit(password?: string): Promise<boolean> {
        if (this.loading) return false;
        this.loading = true;
        this.error = '';

        try {
            await this.store.submitPassword(password);
        } catch (e) {
            runInAction(() => {
                this.error = parseError(e);
            });

            return false;
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }

        return true;
    }

    public handleBack(): void {
        this.router.navigate('/');
    }

    public handleLedgerConnected(): void {
        this.ledgerConnect = false;
    }
}
