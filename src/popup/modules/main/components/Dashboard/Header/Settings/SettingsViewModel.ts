import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

import { AccountabilityStore, Logger, RpcStore, SlidingPanelStore } from '@app/popup/modules/shared';
import { getScrollWidth } from '@app/popup/utils';

@injectable()
export class SettingsViewModel {
    public backupInProgress = false;

    constructor(
        public panel: SlidingPanelStore,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });
    }

    public get version(): string {
        return process.env.EXT_VERSION
            ? `${process.env.EXT_VERSION}${process.env.EXT_ADDITIONAL_COMMITS !== '0' ? `.${process.env.EXT_ADDITIONAL_COMMITS}` : ''}`
            : '';
    }

    public get isTon(): boolean {
        return this.rpcStore.state.selectedConnection.network === 'ton';
    }

    public logOut(): Promise<void> {
        return this.accountability.logOut();
    }

    public async openNetworkSettings(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'network_settings',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        });
    }

    public async manageSeeds(): Promise<void> {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'manage_seeds',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        });
    }

    public async onBackup(): Promise<void> {
        if (this.backupInProgress) return;

        this.backupInProgress = true;

        try {
            const storage = await this.rpcStore.rpc.exportStorage();

            this.downloadFileAsText(storage);
        } catch (e) {
            this.logger.error(e);
        } finally {
            runInAction(() => {
                this.backupInProgress = false;
            });
        }
    }

    private downloadFileAsText(text: string) {
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        a.download = 'sparx-wallet-backup.json';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
