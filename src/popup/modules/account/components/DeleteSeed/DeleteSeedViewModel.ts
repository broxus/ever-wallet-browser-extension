import type * as nt from '@broxus/ever-wallet-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

import { AccountabilityStore, LocalizationStore, NotificationStore, Router, RpcStore } from '@app/popup/modules/shared';
import { convertPublicKey } from '@app/shared';
import { parseError } from '@app/popup/utils';

@injectable()
export class DeleteSeedViewModel {
    public error = '';

    public loading = false;

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });
    }

    public get keyEntry() {
        return this.accountability.currentMasterKey!;
    }

    public get name(): string {
        return (
            this.accountability.masterKeysNames[this.keyEntry.masterKey] || convertPublicKey(this.keyEntry.masterKey)
        );
    }

    public get derivedKeys() {
        return this.storedKeys
            .filter(({ masterKey }) => masterKey === this.keyEntry.masterKey)
            .sort((a, b) => a.accountId - b.accountId);
    }

    public get accountsByPublicKey(): Record<string, number> {
        return Object.values(this.accountability.accountEntries).reduce(
            (result, account) => {
                if (account === undefined) return result;
                if (!result[account.tonWallet.publicKey]) {
                    result[account.tonWallet.publicKey] = 0;
                }
                result[account.tonWallet.publicKey] += 1;
                return result;
            },
            {} as Record<string, number>,
        );
    }

    public get isLast(): boolean {
        return this.accountability.masterKeys.length === 1;
    }

    private get storedKeys(): nt.KeyStoreEntry[] {
        return Object.values(this.accountability.storedKeys).filter(
            (item): item is nt.KeyStoreEntry => item !== undefined,
        );
    }

    public async deleteSeed(): Promise<void> {
        if (this.loading) return;

        this.loading = true;

        try {
            await this.rpcStore.rpc.removeMasterKey(this.keyEntry.masterKey);
            await this.rpcStore.rpc.selectFirstAccount();
            this.notification.show(this.localization.intl.formatMessage({ id: 'DELETE_SEED_SUCCESS_NOTIFICATION' }));

            this.accountability.reset();

            this.onSeedDeleted();
        } catch (e) {
            runInAction(() => {
                this.error = parseError(e);
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    public async logOut(): Promise<void> {
        await this.accountability.logOut();
    }

    public onSeedDeleted(): void {
        this.router.navigate('../../seeds');
    }
}
