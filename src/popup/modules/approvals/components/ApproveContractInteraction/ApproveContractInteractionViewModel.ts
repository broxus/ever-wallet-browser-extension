import { PendingApproval } from '@app/models';
import { AccountabilityStore, LocalizationStore, RpcStore } from '@app/popup/modules/shared';
import { ignoreCheckPassword, parseError, prepareKey } from '@app/popup/utils';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';
import { ApprovalStore } from '../../store';

@injectable()
export class ApproveContractInteractionViewModel {
  passwordModalVisible = false;
  inProcess = false;
  error = '';

  constructor(
    private rpcStore: RpcStore,
    private approvalStore: ApprovalStore,
    private accountability: AccountabilityStore,
    private localization: LocalizationStore,
  ) {
    makeAutoObservable<ApproveContractInteractionViewModel, any>(this, {
      rpcStore: false,
      approvalStore: false,
      accountability: false,
      localization: false,
    });
  }

  get approval() {
    return this.approvalStore.approval as PendingApproval<'callContractMethod'>;
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

  openPasswordModal = () => {
    this.passwordModalVisible = true;
  };

  closePasswordModal = () => {
    this.passwordModalVisible = false;
  };

  onReject = async () => {
    this.inProcess = true;
    await this.approvalStore.rejectPendingApproval();
  };

  onSubmit = async (password?: string, cache?: boolean) => {
    if (this.inProcess) return;

    if (!this.keyEntry) {
      this.error = this.localization.intl.formatMessage({ id: 'ERROR_KEY_ENTRY_NOT_FOUND' });
      return;
    }

    this.inProcess = true;

    try {
      const keyEntry = this.keyEntry;
      const keyPassword = prepareKey({ keyEntry, password, cache });
      const isValid = ignoreCheckPassword(keyPassword) || await this.rpcStore.rpc.checkPassword(keyPassword);

      if (isValid) {
        await this.approvalStore.resolvePendingApproval(keyPassword, true);
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
        this.inProcess = false;
      });
    }
  };
}
