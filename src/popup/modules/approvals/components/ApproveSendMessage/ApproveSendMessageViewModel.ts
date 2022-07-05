import { MessageAmount, Nekoton, PendingApproval, TransferMessageToPrepare } from '@app/models';
import {
  AccountabilityStore,
  createEnumField,
  LocalizationStore,
  NekotonToken,
  RpcStore,
  SelectableKeys,
} from '@app/popup/modules/shared';
import { ignoreCheckPassword, parseError } from '@app/popup/utils';
import { Logger } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import Decimal from 'decimal.js';
import { action, autorun, makeAutoObservable, runInAction } from 'mobx';
import { Disposable, inject, injectable } from 'tsyringe';
import { ApprovalStore } from '../../store';

@injectable()
export class ApproveSendMessageViewModel implements Disposable {
  step = createEnumField(Step, Step.MessagePreview);
  inProcess = false;
  error = '';
  fees = '';
  selectedKey: nt.KeyStoreEntry | undefined = this.selectableKeys?.keys[0];
  tokenTransaction: TokenTransaction | undefined;

  private estimateFeesDisposer: () => void;
  private getTokenRootDetailsDisposer: () => void;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private approvalStore: ApprovalStore,
    private accountability: AccountabilityStore,
    private localization: LocalizationStore,
    private logger: Logger,
  ) {
    makeAutoObservable<ApproveSendMessageViewModel, any>(this, {
      nekoton: false,
      rpcStore: false,
      approvalStore: false,
      accountability: false,
      localization: false,
      logger: false,
    });

    this.estimateFeesDisposer = autorun(() => {
      if (!this.approval || !this.selectedKey || !this.account) return;

      const { recipient, amount } = this.approval.requestData;
      const messageToPrepare: TransferMessageToPrepare = {
        publicKey: this.selectedKey.publicKey,
        recipient,
        amount,
        payload: undefined,
      };

      this.rpcStore.rpc
        .estimateFees(this.account.tonWallet.address, messageToPrepare, {})
        .then(action((fees) => { this.fees = fees; }))
        .catch(this.logger.error);
    });

    this.getTokenRootDetailsDisposer = autorun(() => {
      if (!this.approval) return;

      const { recipient, knownPayload } = this.approval.requestData;

      if (
        knownPayload?.type !== 'token_outgoing_transfer' &&
        knownPayload?.type !== 'token_swap_back'
      ) return;

      this.rpcStore.rpc
        .getTokenRootDetailsFromTokenWallet(recipient)
        .then(action((details) => {
          this.tokenTransaction = {
            amount: knownPayload.data.tokens,
            symbol: details.symbol,
            decimals: details.decimals,
            rootTokenContract: details.address,
            old: details.version !== 'Tip3',
          };
        }))
        .catch(this.logger.error);
    });
  }

  dispose(): void | Promise<void> {
    this.estimateFeesDisposer();
    this.getTokenRootDetailsDisposer();
  }

  get approval() {
    return this.approvalStore.approval as PendingApproval<'sendMessage'>;
  }

  get networkName(): string {
    return this.rpcStore.state.selectedConnection.name;
  }

  get account(): nt.AssetsList {
    return this.accountability.accountEntries[this.approval.requestData.sender];
  }

  get masterKeysNames(): Record<string, string> {
    return this.accountability.masterKeysNames;
  }

  get selectableKeys(): SelectableKeys | undefined {
    if (!this.account) return undefined;

    return this.accountability.getSelectableKeys(this.account);
  }

  get contractState(): nt.ContractState | undefined {
    return this.accountability.accountContractStates[this.account.tonWallet.address];
  }

  get balance(): Decimal {
    return new Decimal(this.contractState?.balance ?? '0');
  }

  get isDeployed(): boolean {
    return this.contractState?.isDeployed ||
      !this.nekoton.getContractTypeDetails(this.account.tonWallet.contractType).requiresSeparateDeploy;
  }

  get messageAmount(): MessageAmount {
    return !this.tokenTransaction ?
      { type: 'ton_wallet', data: { amount: this.approval.requestData.amount } } :
      {
        type: 'token_wallet',
        data: {
          amount: this.tokenTransaction.amount,
          attachedAmount: this.approval.requestData.amount,
          symbol: this.tokenTransaction.symbol,
          decimals: this.tokenTransaction.decimals,
          rootTokenContract: this.tokenTransaction.rootTokenContract,
          old: this.tokenTransaction.old,
        },
      };
  }

  setKey = (key: nt.KeyStoreEntry | undefined) => {
    this.selectedKey = key;
  };

  onReject = async () => {
    this.inProcess = true;
    await this.approvalStore.rejectPendingApproval();
  };

  onSubmit = async (keyPassword: nt.KeyPassword) => {
    if (this.inProcess) return;

    this.inProcess = true;

    try {
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

export enum Step {
  MessagePreview,
  EnterPassword,
}

interface TokenTransaction {
  amount: string
  symbol: string
  decimals: number
  rootTokenContract: string
  old: boolean
}
