import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';

import { Contact } from '@app/models';
import { ContactsStore } from '@app/popup/modules/contacts';
import { AccountabilityStore, ConnectionStore } from '@app/popup/modules/shared';
import browser from 'webextension-polyfill';
import { AssetTransferStore } from '../../store';

@injectable()
export class SendResultViewModel {
    messageHash: string | undefined;

    gasless = false;

    constructor(
        private transfer: AssetTransferStore,
        private contactsStore: ContactsStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });
    }

    public get contacts(): Record<string, Contact> {
        return this.contactsStore.contacts;
    }

    public get recipient(): string {
        return this.transfer.messageParams!.recipient;
    }

    public get root(): string {
        const { asset } = this.transfer;
        return asset.type === 'ever_wallet' ? 'native' : asset.data.rootTokenContract;
    }

    public get transactionHash(): string | undefined {
        if (!this.messageHash) return undefined;
        if (this.gasless) return this.messageHash;
        return this.accountability.selectedAccountTransactions.find((tx) => tx.inMessage.hash === this.messageHash)?.id
            .hash;
    }

    public get confirmed(): boolean {
        return this.transactionHash !== undefined;
    }

    public async openInExplorer(hash: string): Promise<void> {
        if (this.gasless) {
            await browser.tabs.create({
                url: this.connectionStore.messageExplorerLink(hash),
                active: false,
            });
        } else {
            await browser.tabs.create({
                url: this.connectionStore.transactionExplorerLink(hash),
                active: false,
            });
        }
    }
}
