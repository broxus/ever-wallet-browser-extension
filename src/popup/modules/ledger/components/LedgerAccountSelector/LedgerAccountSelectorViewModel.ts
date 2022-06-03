import { LocalizationStore, RpcStore } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import { Logger } from '@app/shared';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import type { KeyStoreEntry } from 'nekoton-wasm';
import { injectable } from 'tsyringe';

@injectable()
export class LedgerAccountSelectorViewModel {
  loading = false;
  error: string | undefined;
  ledgerAccounts: LedgerAccountDetails[] = [];
  currentPage = 1;
  selected = new Set<number>();
  keysToRemove = new Set<string>();

  onSuccess!: () => void;
  onError!: (e: any) => void;

  constructor(
    private rpcStore: RpcStore,
    private localizationStore: LocalizationStore,
    private logger: Logger,
  ) {
    makeObservable(this, {
      loading: observable,
      error: observable,
      ledgerAccounts: observable,
      currentPage: observable,
      selected: observable,
      keysToRemove: observable,
      storedKeys: computed,
      resetError: action,
      setError: action,
      setLoading: action,
      getNewPage: action,
      saveAccounts: action,
      setChecked: action,
    });
  }

  get storedKeys() {
    return this.rpcStore.state.storedKeys;
  }

  resetError = () => {
    this.error = undefined;
  };

  setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  setError = (error: string) => {
    this.error = error;
  };

  setChecked = (account: LedgerAccountDetails, checked: boolean) => {
    const { publicKey, index } = account;

    if (!checked) {
      this.selected.delete(index);
      this.keysToRemove.add(publicKey);
    } else {
      this.selected.add(index);
      this.keysToRemove.delete(publicKey);
    }
  };

  getNewPage = async (page: LedgerPage) => {
    let accountSlice: Array<LedgerAccountDetails> = [];

    this.loading = true;
    this.error = undefined;

    try {
      switch (page) {
        case LedgerPage.First:
          accountSlice = await this.rpcStore.rpc.getLedgerFirstPage();
          break;

        case LedgerPage.Next:
          accountSlice = await this.rpcStore.rpc.getLedgerNextPage();
          break;

        case LedgerPage.Previous:
          accountSlice = await this.rpcStore.rpc.getLedgerPreviousPage();
          break;

        default:
          this.logger.error(`[LedgerAccountSelectorViewModel] unknown page value: ${page}`);
          break;
      }

      runInAction(() => {
        this.ledgerAccounts = accountSlice;
        this.currentPage = (accountSlice[0]?.index ?? 0) / 5 + 1;
      });
    } catch (e: any) {
      this.logger.error(e);
      this.setError(parseError(e));
      this.onError(e);
    } finally {
      this.setLoading(false);
    }
  };

  saveAccounts = async () => {
    this.loading = true;
    this.error = undefined;

    for (const publicKeyToRemove of this.keysToRemove.values()) {
      const account = Object.values(this.rpcStore.state.accountEntries).find(
        (account) => account.tonWallet.publicKey === publicKeyToRemove,
      );

      try {
        await this.rpcStore.rpc.removeKey({ publicKey: publicKeyToRemove });

        if (account) {
          await this.rpcStore.rpc.removeAccount(account.tonWallet.address);
        }
      } catch (e) {
        this.logger.error(e);
        this.setError(parseError(e));
      }
    }

    for (const accountId of this.selected.values()) {
      let key: KeyStoreEntry | undefined;

      try {
        key = await this.rpcStore.rpc.createLedgerKey({
          accountId,
        });

        await this.rpcStore.rpc.createAccount({
          name: `Ledger ${accountId + 1}`,
          publicKey: key.publicKey,
          contractType: 'SafeMultisigWallet',
          workchain: 0,
        });
      } catch (e: any) {
        if (key) {
          this.rpcStore.rpc.removeKey({ publicKey: key.publicKey }).catch(this.logger.error);
        }

        this.logger.error(e);
        this.setError(parseError(e));
      }
    }

    this.setLoading(false);

    if (!this.error) {
      this.onSuccess();
    }
  };
}

interface LedgerAccountDetails {
  publicKey: string;
  index: number;
}

export enum LedgerPage {
  First,
  Next,
  Previous,
}
