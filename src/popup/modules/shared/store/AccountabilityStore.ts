import { Nekoton } from '@app/models';
import { NekotonToken } from '@app/popup/modules/shared';
import { Logger, TokenWalletState } from '@app/shared';
import uniqBy from 'lodash.uniqby';
import { IReactionDisposer, Lambda, makeAutoObservable, observe, reaction } from 'mobx';
import type nt from 'nekoton-wasm';
import { Disposable, inject, singleton } from 'tsyringe';
import { RpcStore } from './RpcStore';

@singleton()
export class AccountabilityStore implements Disposable {
  step: AccountabilityStep = AccountabilityStep.MANAGE_SEEDS;
  currentAccount: nt.AssetsList | undefined;
  currentDerivedKey: nt.KeyStoreEntry | undefined;
  currentMasterKey: nt.KeyStoreEntry | undefined;

  private reactionDisposer: IReactionDisposer | undefined;
  private loggerDisposer: Lambda | undefined;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private logger: Logger,
  ) {
    makeAutoObservable<AccountabilityStore, any>(this, {
      nekoton: false,
      rpcStore: false,
      logger: false,
    });

    this.initialize();
  }

  async initialize() {
    this.reactionDisposer = reaction(() => this.selectedMasterKey, async (selectedMasterKey) => {
      if (!selectedMasterKey) return;

      const key = Object.values(this.storedKeys).find(({ masterKey }) => masterKey === selectedMasterKey);

      if (key !== undefined) {
        await this.rpcStore.rpc.updateRecentMasterKey(key);
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      this.loggerDisposer = observe(this, () => {
        this.logger.log('[AccountabilityStore]', this);
      });
    }

    for (const address of Object.keys(this.accountEntries)) {
      if (this.accountsVisibility[address] == null) {
        await this.rpcStore.rpc.updateAccountVisibility(address as string, true);
      }
    }
  }

  dispose(): void | Promise<void> {
    this.reactionDisposer?.();
    this.loggerDisposer?.();
  }

  get storedKeys(): Record<string, nt.KeyStoreEntry> {
    return this.rpcStore.state.storedKeys;
  }

  get accountCustodians(): Record<string, string[]> {
    return this.rpcStore.state.accountCustodians;
  }

  get accountEntries(): Record<string, nt.AssetsList> {
    return this.rpcStore.state.accountEntries;
  }

  get externalAccounts(): Array<{ address: string; externalIn: string[]; publicKey: string }> {
    return this.rpcStore.state.externalAccounts;
  }

  get selectedMasterKey(): string | undefined {
    return this.rpcStore.state.selectedMasterKey;
  }

  get accountsVisibility(): Record<string, boolean> {
    return this.rpcStore.state.accountsVisibility ?? {};
  }

  get selectedAccount(): nt.AssetsList | undefined {
    return this.rpcStore.state.selectedAccount;
  }

  get selectedAccountAddress(): string | undefined {
    return this.selectedAccount?.tonWallet.address;
  }

  get selectedAccountPublicKey() {
    return this.selectedAccount?.tonWallet.publicKey;
  }

  get accountContractStates(): Record<string, nt.ContractState> {
    return this.rpcStore.state.accountContractStates;
  }

  get accountTokenStates(): Record<string, Record<string, TokenWalletState>> {
    return this.rpcStore.state.accountTokenStates;
  }

  get masterKeysNames(): Record<string, string> {
    return this.rpcStore.state.masterKeysNames || {};
  }

  get recentMasterKeys(): nt.KeyStoreEntry[] {
    return this.rpcStore.state.recentMasterKeys || [];
  }

  // TON Wallet contract state of selected account
  get tonWalletState(): nt.ContractState | undefined {
    return this.selectedAccountAddress ? this.accountContractStates[this.selectedAccountAddress] : undefined;
  }

  // Token Wallet state of selected account
  get tokenWalletStates(): Record<string, TokenWalletState> {
    return this.selectedAccountAddress ? this.accountTokenStates?.[this.selectedAccountAddress] ?? {} : {};
  }

  // All available keys includes master key
  get masterKeys(): nt.KeyStoreEntry[] {
    return uniqBy(
      Object.values(this.storedKeys),
      ({ masterKey }) => masterKey,
    );
  }

  // All direct derived keys in managed seed
  get derivedKeys(): nt.KeyStoreEntry[] {
    return Object.values(this.storedKeys).filter(
      (key) => key.masterKey === this.currentMasterKey?.masterKey,
    );
  }

  // All related accounts in managed derived key
  get currentDerivedKeyAccounts(): nt.AssetsList[] {
    if (!this.currentDerivedKey) {
      return [];
    }

    return Object.values(this.accountEntries).filter(
      (entry) => entry.tonWallet.publicKey === this.currentDerivedKey!.publicKey,
    );
  }

  // All linked external accounts in managed derived key
  get currentDerivedKeyExternalAccounts(): nt.AssetsList[] {
    if (!this.currentDerivedKey) {
      return [];
    }

    return this.externalAccounts
      .filter((account) => account.externalIn.includes(this.currentDerivedKey!.publicKey))
      .map((account) => this.accountEntries[account.address])
      .filter((account) => !!account);
  }

  get derivedKeysPubKeys(): string[] {
    return Object.values(this.storedKeys)
      .filter((key) => key.masterKey === this.selectedMasterKey)
      .map((key) => key.publicKey);
  }

  // All available accounts of the selected seed
  get internalAccounts(): Record<string, nt.AssetsList> {
    const accounts: Record<string, nt.AssetsList> = {};
    const derivedKeysPubKeys = this.derivedKeysPubKeys;

    Object.values(this.accountEntries).forEach((entry) => {
      if (derivedKeysPubKeys.includes(entry.tonWallet.publicKey) && !accounts[entry.tonWallet.address]) {
        accounts[entry.tonWallet.address] = entry;
      }
    });

    return accounts;
  }

  get accounts(): nt.AssetsList[] {
    const externalAccounts: { [address: string]: nt.AssetsList } = { ...this.internalAccounts };

    this.externalAccounts.forEach(({ address, externalIn }) => {
      this.derivedKeysPubKeys.forEach((key) => {
        if (externalIn.includes(key)) {
          const entry = this.accountEntries[address];
          if (entry != null && externalAccounts[entry.tonWallet.address] == null) {
            externalAccounts[entry.tonWallet.address] = entry;
          }
        }
      });
    });

    return Object.values(externalAccounts)
      .filter(({ tonWallet }) => (tonWallet ? this.accountsVisibility[tonWallet.address] : false))
      .sort((a, b) => a.name.localeCompare(b.name));
    // TODO: check sort
    // .sort((a, b) => {
    //   if (a.name < b.name) return -1;
    //   if (a.name > b.name) return 1;
    //   return 0;
    // });
  }

  get contractTypeDetails(): nt.TonWalletDetails | undefined {
    if (!this.selectedAccount) {
      return undefined;
    }

    return this.nekoton.getContractTypeDetails(this.selectedAccount.tonWallet.contractType);
  }

  get nextAccountId(): number {
    if (!this.currentMasterKey) {
      return 0;
    }

    const accountIds = Object.values(this.storedKeys)
      .filter((key) => key.masterKey === this.currentMasterKey!.masterKey)
      .map((key) => key.accountId)
      .sort((a, b) => a - b);

    let nextAccountId = 0;
    for (let i = 0; i < accountIds.length; ++i) {
      if (nextAccountId !== accountIds[i]) {
        break;
      }

      ++nextAccountId;
    }

    return nextAccountId;
  }

  setCurrentAccount(account: nt.AssetsList | undefined) {
    this.currentAccount = account;
  }

  setCurrentDerivedKey(key: nt.KeyStoreEntry | undefined) {
    this.currentDerivedKey = key;
  }

  setCurrentMasterKey(key: nt.KeyStoreEntry | undefined) {
    this.currentMasterKey = key;
  }

  setStep(step: AccountabilityStep) {
    this.step = step;
  }

  onManageMasterKey = (value?: nt.KeyStoreEntry) => {
    this.setCurrentMasterKey(value);
    this.setStep(AccountabilityStep.MANAGE_SEED);
  };

  onManageDerivedKey = (derivedKey?: nt.KeyStoreEntry) => {
    this.setCurrentDerivedKey(derivedKey);
    this.setStep(AccountabilityStep.MANAGE_DERIVED_KEY);
  };

  onManageAccount = (account?: nt.AssetsList) => {
    this.setCurrentAccount(account);
    this.setStep(AccountabilityStep.MANAGE_ACCOUNT);
  };

  logOut = async () => {
    await this.rpcStore.rpc.logOut();
    window.close();
  };

  reset = () => {
    this.setStep(AccountabilityStep.MANAGE_SEEDS);
    this.setCurrentAccount(undefined);
    this.setCurrentDerivedKey(undefined);
    this.setCurrentMasterKey(undefined);
  };
}

export enum AccountabilityStep {
  MANAGE_SEEDS,
  MANAGE_SEED,
  CREATE_SEED,
  MANAGE_DERIVED_KEY,
  CREATE_DERIVED_KEY,
  MANAGE_ACCOUNT,
  CREATE_ACCOUNT,
}
