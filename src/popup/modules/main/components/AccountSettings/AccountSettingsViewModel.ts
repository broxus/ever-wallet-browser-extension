import {
  AccountabilityStore,
  LocalizationStore,
  Panel,
  RpcStore,
  AccountabilityStep,
  DrawerContext,
} from '@app/popup/modules/shared';
import { getScrollWidth } from '@app/popup/utils';
import { convertAddress } from '@app/shared';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';
import type nt from 'nekoton-wasm';
import manifest from '../../../../../static/manifest.json';

@injectable()
export class AccountSettingsViewModel {
  dropdownActive = false;
  drawer!: DrawerContext;

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
    private localization: LocalizationStore,
  ) {
    makeAutoObservable<AccountSettingsViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
      localization: false,
    });
  }

  get version(): string {
    return manifest.version ?? '';
  }

  get selectedLocale(): string {
    return this.localization.locale;
  }

  get selectedSeedName(): string {
    const key = this.accountability.selectedMasterKey;

    if (key) {
      return this.accountability.masterKeysNames[key] || convertAddress(key);
    }

    return '';
  }

  get recentMasterKeys() {
    return this.accountability.recentMasterKeys
      .filter((key) => key.masterKey !== this.accountability.selectedMasterKey)
      .map((key) => ({
        key,
        name: this.accountability.masterKeysNames[key.masterKey] || convertAddress(key.masterKey),
      }));
  }

  toggleDropdown = () => {
    this.dropdownActive = !this.dropdownActive;
  };

  hideDropdown = () => {
    this.dropdownActive = !this.dropdownActive;
  };

  setEnglishLocale = () => this.localization.setLocale('en');

  setKoreanLocale = () => this.localization.setLocale('ko');

  manageSeeds = async () => {
    this.hideDropdown();

    await this.rpcStore.rpc.openExtensionInExternalWindow({
      group: 'manage_seeds',
      width: 360 + getScrollWidth() - 1,
      height: 600 + getScrollWidth() - 1,
    });
  };

  selectMasterKey = async (masterKey: string) => {
    const key = this.accountability.masterKeys.find((entry) => entry.masterKey === masterKey);

    if (key == null) return;

    this.hideDropdown();

    if (key.masterKey === this.accountability.selectedMasterKey) return;

    const derivedKeys = Object.values(this.accountability.storedKeys)
      .filter((item) => item.masterKey === key.masterKey)
      .map((item) => item.publicKey);

    const availableAccounts: Record<string, nt.AssetsList> = {};

    Object.values(this.accountability.accountEntries).forEach((account) => {
      const address = account.tonWallet.address;
      if (
        derivedKeys.includes(account.tonWallet.publicKey) &&
        this.accountability.accountsVisibility[address]
      ) {
        availableAccounts[address] = account;
      }
    });

    this.accountability.externalAccounts.forEach(({ address, externalIn }) => {
      derivedKeys.forEach((derivedKey) => {
        if (externalIn.includes(derivedKey)) {
          const account = this.accountability.accountEntries[address] as nt.AssetsList | undefined;

          if (account != null && this.accountability.accountsVisibility[address]) {
            availableAccounts[address] = account;
          }
        }
      });
    });

    const accounts = Object.values(availableAccounts)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (accounts.length === 0) {
      this.accountability.setCurrentMasterKey(key);
      this.accountability.setStep(AccountabilityStep.MANAGE_SEED);

      this.drawer.setPanel(Panel.MANAGE_SEEDS);
    } else {
      await this.rpcStore.rpc.selectMasterKey(key.masterKey);
      await this.rpcStore.rpc.selectAccount(accounts[0].tonWallet.address);

      this.drawer.setPanel(undefined);
    }
  };

  logOut = () => this.accountability.logOut();
}
