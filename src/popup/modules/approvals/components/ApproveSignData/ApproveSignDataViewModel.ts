import { PendingApproval } from '@app/models';
import { AccountabilityStore, LocalizationStore, RpcStore } from '@app/popup/modules/shared';
import { ignoreCheckPassword, parseError, prepareKey } from '@app/popup/utils';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';
import { ApprovalStore } from '../../store';
import { DataConverter, DisplayType } from '../../utils';

@injectable()
export class ApproveSignDataViewModel {
  displayType = DisplayType.Base64;
  passwordModalVisible = false;
  submitted = false;
  loading = false;
  error = '';

  constructor(
    private rpcStore: RpcStore,
    private approvalStore: ApprovalStore,
    private accountability: AccountabilityStore,
    private localization: LocalizationStore,
    private converter: DataConverter,
  ) {
    makeAutoObservable<ApproveSignDataViewModel, any>(this, {
      rpcStore: false,
      approvalStore: false,
      accountability: false,
      localization: false,
      converter: false,
    });
  }

  get approval() {
    return this.approvalStore.approval as PendingApproval<'signData'>;
  }

  get networkName(): string {
    return this.rpcStore.state.selectedConnection.name;
  }

  get keyEntry(): nt.KeyStoreEntry {
    return this.accountability.storedKeys[this.approval.requestData.publicKey];
  }

  get account(): nt.AssetsList | undefined {
    return Object.values(this.accountability.accountEntries).find(
      (account) => account.tonWallet.publicKey === this.approval.requestData.publicKey,
    );
  }

  get data(): string {
    return this.converter.convert(
      this.approval.requestData.data,
      this.displayType,
    );
  }

  openPasswordModal = () => {
    this.passwordModalVisible = true;
  };

  closePasswordModal = () => {
    this.passwordModalVisible = false;
  };

  setDisplayType = (displayType: DisplayType) => {
    this.displayType = displayType;
  };

  onReject = async () => {
    this.loading = true;
    await this.approvalStore.rejectPendingApproval();
  };

  onSubmit = async (password?: string, cache?: boolean) => {
    if (!this.keyEntry) {
      this.error = this.localization.intl.formatMessage({ id: 'ERROR_KEY_ENTRY_NOT_FOUND' });
      return;
    }

    this.loading = true;

    try {
      const keyEntry = this.keyEntry;
      const keyPassword = prepareKey({ keyEntry, password, cache });
      const isValid = ignoreCheckPassword(keyPassword) || await this.rpcStore.rpc.checkPassword(keyPassword);

      if (isValid) {
        await this.approvalStore.resolvePendingApproval(keyPassword, true);
        runInAction(() => {
          this.submitted = true;
        });
      } else {
        runInAction(() => {
          this.error = this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' });
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
}
