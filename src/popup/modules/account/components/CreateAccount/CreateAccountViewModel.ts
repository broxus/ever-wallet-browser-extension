import { Nekoton } from '@app/models';
import {
  AccountabilityStep,
  AccountabilityStore,
  CONTRACT_TYPES_KEYS,
  createEnumField,
  DrawerContext,
  LocalizationStore,
  NekotonToken,
  Panel,
  RpcStore,
} from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import { DEFAULT_CONTRACT_TYPE, Logger } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { autorun, makeAutoObservable, runInAction } from 'mobx';
import { ChangeEvent } from 'react';
import { Disposable, inject, injectable } from 'tsyringe';
import { AddAccountFlow } from '../../models';

@injectable()
export class CreateAccountViewModel implements Disposable {
  drawer!: DrawerContext;
  step = createEnumField(Step, Step.Index);
  contractType = DEFAULT_CONTRACT_TYPE;
  flow = AddAccountFlow.CREATE;
  loading = false;
  address = '';
  error = '';
  name = this.defaultAccountName;

  private disposer: () => void;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
    private localization: LocalizationStore,
    private logger: Logger,
  ) {
    makeAutoObservable<CreateAccountViewModel, any>(this, {
      nekoton: false,
      rpcStore: false,
      accountability: false,
      localizationStore: false,
      logger: false,
    });

    if (!this.accountability.currentDerivedKey && this.accountability.derivedKeys[0]) {
      runInAction(() => {
        this.accountability.setCurrentDerivedKey(this.accountability.derivedKeys[0]);
      });
    }

    this.disposer = autorun(() => {
      if (!this.availableContracts.includes(this.contractType) || !this.contractType) {
        runInAction(() => {
          this.contractType = this.availableContracts[0];
        });
      }
    });
  }

  dispose(): void {
    this.disposer();
  }

  get defaultAccountName() {
    const accountId = this.accountability.currentDerivedKey?.accountId || 0;
    const number = this.accountability.currentDerivedKeyAccounts.length;
    return this.localization.intl.formatMessage(
      { id: 'ACCOUNT_GENERATED_NAME' },
      { accountId: accountId + 1, number: number + 1 },
    );
  }

  get derivedKeys(): nt.KeyStoreEntry[] {
    return this.accountability.derivedKeys;
  }

  get currentDerivedKey(): nt.KeyStoreEntry {
    return this.accountability.currentDerivedKey ?? this.derivedKeys[0];
  }

  get availableContracts(): nt.ContractType[] {
    const currentDerivedKey = this.accountability.currentDerivedKey;

    if (!currentDerivedKey) {
      return CONTRACT_TYPES_KEYS;
    }

    const accountAddresses = this.accountability.currentDerivedKeyAccounts.map(
      (account) => account.tonWallet.address,
    );

    return CONTRACT_TYPES_KEYS.filter((type) => {
      const address = this.nekoton.computeTonWalletAddress(currentDerivedKey.publicKey, type, 0);
      return !accountAddresses.includes(address);
    });
  }

  setCurrentDerivedKey = (key: nt.KeyStoreEntry) => {
    this.accountability.setCurrentDerivedKey(key);
  };

  setFlow = (flow: AddAccountFlow) => {
    this.flow = flow;
  };

  setContractType = (value: nt.ContractType) => {
    this.contractType = value;
  };

  onAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.address = e.target.value;
  };

  onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.name = e.target.value;
  };

  onManageDerivedKey = () => {
    this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY);
    this.drawer.setPanel(Panel.ACCOUNTS_MANAGER);
  };

  onSubmit = async () => {
    if (!this.accountability.currentDerivedKey || this.loading) return;

    this.loading = true;

    try {
      const account = await this.rpcStore.rpc.createAccount({
        contractType: this.contractType,
        name: this.name,
        publicKey: this.accountability.currentDerivedKey.publicKey,
        workchain: 0,
      });

      if (account) {
        this.manageAccount(account);
      }
    } catch (e: any) {
      runInAction(() => {
        this.error = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  onAddExisting = async () => {
    if (!this.accountability.currentDerivedKey) return;

    this.loading = true;

    try {
      const data = await this.rpcStore.rpc.getTonWalletInitData(this.address);
      const { publicKey, contractType, workchain, custodians } = data;

      if (!this.accountability.currentDerivedKey) return;

      const currentPublicKey = this.accountability.currentDerivedKey.publicKey;

      if (publicKey === currentPublicKey) {
        const hasAccount = this.accountability.currentDerivedKeyAccounts.some(
          (account) => account.tonWallet.address === this.address,
        );

        if (!hasAccount) {
          this.manageAccount(
            await this.createAccount(contractType, publicKey, workchain),
          );

          this.logger.log('[CreateAccountViewModel] address not found in derived key -> create');
        } else {
          // TODO: ?
          // setError();
        }
      } else if (custodians.includes(currentPublicKey)) {
        const existingAccount = this.accountability.accountEntries[this.address] as nt.AssetsList | undefined;

        if (!existingAccount) {
          await this.rpcStore.rpc.addExternalAccount(this.address, publicKey, currentPublicKey);

          this.manageAccount(
            await this.createAccount(contractType, publicKey, workchain),
          );

          this.logger.log('[CreateAccountViewModel] create and add account to externals');
        } else {
          await this.rpcStore.rpc.addExternalAccount(this.address, publicKey, currentPublicKey);
          await this.rpcStore.rpc.updateAccountVisibility(this.address, true);

          this.manageAccount(existingAccount);

          this.logger.log('[CreateAccountViewModel] add to externals');
        }
      } else {
        runInAction(() => {
          this.error = this.localization.intl.formatMessage({
            id: 'CREATE_ACCOUNT_PANEL_ACCOUNT_EXISTS_ERROR',
          });
        });
      }
    } catch (e: any) {
      runInAction(() => {
        this.error = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  onNext = () => {
    switch (this.step.value) {
      case Step.Index:
        if (this.flow === AddAccountFlow.CREATE) {
          this.step.setEnterName();
        } else if (this.flow === AddAccountFlow.IMPORT) {
          this.step.setEnterAddress();
        }
        break;

      case Step.EnterName:
        this.step.setSelectContractType();
        break;
    }
  };

  onBack = () => {
    switch (this.step.value) {
      case Step.EnterName:
      case Step.EnterAddress:
        this.error = '';
        this.step.setIndex();
        break;

      case Step.SelectContractType:
        if (this.flow === AddAccountFlow.CREATE) {
          this.step.setEnterName();
        } else if (this.flow === AddAccountFlow.IMPORT) {
          this.step.setEnterAddress();
        }
        break;

      default:
        this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY);
        break;
    }
  };

  private manageAccount = (account: nt.AssetsList) => {
    this.drawer.setPanel(Panel.ACCOUNTS_MANAGER);
    this.accountability.onManageAccount(account);
  };

  private createAccount = (contractType: nt.ContractType, publicKey: string, workchain: number): Promise<nt.AssetsList> => {
    const name = this.name;
    const explicitAddress = this.address;

    return this.rpcStore.rpc.createAccount({ contractType, publicKey, workchain, name, explicitAddress });
  };
}

export enum Step {
  Index,
  EnterAddress,
  EnterName,
  SelectContractType,
}
