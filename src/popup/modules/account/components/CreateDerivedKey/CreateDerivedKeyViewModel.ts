import { AccountabilityStep, AccountabilityStore, createEnumField, RpcStore } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class CreateDerivedKeyViewModel {
  step = createEnumField(Step, Step.Password);
  password = '';
  publicKeys: PublicKeys = new Map();
  inProcess = false;
  passwordError = '';
  selectKeysError = '';

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<CreateDerivedKeyViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
    });
  }

  get storedKeys(): Record<string, nt.KeyStoreEntry> {
    return this.accountability.storedKeys;
  }

  get derivedKeys(): nt.KeyStoreEntry[] {
    return this.accountability.derivedKeys;
  }

  get currentMasterKey(): nt.KeyStoreEntry | undefined {
    return this.accountability.currentMasterKey;
  }

  get accounts(): nt.AssetsList[] {
    return this.accountability.accounts;
  }

  get selectedAccount(): nt.AssetsList | undefined {
    return this.accountability.selectedAccount;
  }

  get selectedAccountPublicKey() {
    return this.accountability.selectedAccountPublicKey!;
  }

  goToManageSeed = () => this.accountability.setStep(AccountabilityStep.MANAGE_SEED);

  onSubmitPassword = async (password: string) => {
    if (!this.currentMasterKey) return;

    this.inProcess = true;

    try {
      const rawPublicKeys = await this.rpcStore.rpc.getPublicKeys({
        type: 'master_key',
        data: {
          password,
          offset: 0,
          limit: PUBLIC_KEYS_LIMIT,
          masterKey: this.currentMasterKey.masterKey,
        },
      });

      runInAction(() => {
        this.publicKeys = new Map(rawPublicKeys.map((key, i) => [key, i]));
        this.password = password;
        this.step.setSelect();
      });
    } catch (e: any) {
      runInAction(() => {
        this.passwordError = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.inProcess = false;
      });
    }
  };

  onSubmitKeys = async (selectedKeys: PublicKeys) => {
    if (!this.currentMasterKey || !this.password) return;

    this.inProcess = true;

    const { masterKey } = this.currentMasterKey;
    const currentKeysIds = this.derivedKeys.map(({ accountId }) => accountId);
    const selectedKeysIds = [...selectedKeys.values()];
    const keysIdsToCreate = selectedKeysIds.filter(
      (accountId) => !currentKeysIds.includes(accountId),
    );
    const keyIdsToRemove = currentKeysIds.filter(
      (accountId) => !selectedKeysIds.includes(accountId),
    );
    const keysToRemove = [...this.publicKeys.entries()]
      .filter(([, accountId]) => keyIdsToRemove.includes(accountId))
      .map(([publicKey]) => publicKey);
    const paramsToCreate = keysIdsToCreate.map((accountId) => ({
      accountId,
      masterKey,
      password: this.password,
    }));
    const paramsToRemove = keysToRemove.map((publicKey) => ({ publicKey }));
    const accountsToRemove = this.accounts
      .filter(({ tonWallet: { publicKey } }) => keysToRemove.includes(publicKey))
      .map(({ tonWallet: { address } }) => address);

    try {
      if (paramsToCreate.length) {
        await this.rpcStore.rpc.createDerivedKeys(paramsToCreate);
      }

      if (accountsToRemove.length) {
        await this.rpcStore.rpc.removeAccounts(accountsToRemove);
      }

      if (paramsToRemove.length) {
        await this.rpcStore.rpc.removeKeys(paramsToRemove);
      }
    } catch (e: any) {
      runInAction(() => {
        this.selectKeysError = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.inProcess = false;
      });
    }

    this.goToManageSeed();
  };
}

const PUBLIC_KEYS_LIMIT = 100;

export type PublicKeys = Map<string, number>;

export enum Step {
  Password,
  Select,
}
