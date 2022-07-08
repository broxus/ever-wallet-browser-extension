import { ConfirmMessageToPrepare, MessageAmount, Nekoton, SubmitTransaction } from '@app/models';
import {
  AccountabilityStore,
  createEnumField,
  DrawerContext,
  NekotonToken,
  RpcStore,
  SelectableKeys,
} from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import { AggregatedMultisigTransactions, currentUtime, extractTransactionAddress, Logger } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { computed, makeAutoObservable, runInAction, when } from 'mobx';
import { inject, injectable } from 'tsyringe';

@injectable()
export class MultisigTransactionViewModel {
  transaction!: (nt.TonWalletTransaction | nt.TokenWalletTransaction) & SubmitTransaction;
  drawer!: DrawerContext;
  step = createEnumField(Step, Step.Preview);
  parsedTokenTransaction: ParsedTokenTransaction | undefined;
  selectedKey: nt.KeyStoreEntry | undefined;
  loading = false;
  error = '';
  fees = '';

  private disposer: () => void;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
    private logger: Logger,
  ) {
    makeAutoObservable<MultisigTransactionViewModel, any>(this, {
      nekoton: false,
      rpcStore: false,
      logger: false,
      disposer: false,
      custodians: computed.struct,
      accountUnconfirmedTransactions: computed.struct,
      accountMultisigTransactions: computed.struct,
    });

    this.disposer = when(() => !!this.transaction, async () => {
      this.setSelectedKey(this.filteredSelectableKeys[0]);
      await this.getTokenRootDetailsFromTokenWallet(this.transaction);
    });
  }

  dispose(): Promise<void> | void {
    this.disposer();
  }

  get masterKeysNames(): Record<string, string> {
    return this.accountability.masterKeysNames;
  }

  get clockOffset(): number {
    return this.rpcStore.state.clockOffset;
  }

  get expirationTime(): number {
    const account = this.accountability.accountEntries[this.source] as nt.AssetsList | undefined;
    return account ? this.nekoton.getContractTypeDetails(account.tonWallet.contractType).expirationTime : 3600;
  }

  get isExpired(): boolean {
    return this.transaction.createdAt + this.expirationTime <= currentUtime(this.clockOffset);
  }

  get custodians(): string[] {
    return this.accountability.accountCustodians[this.source] ?? [];
  }

  get selectableKeys(): SelectableKeys {
    return this.accountability.getSelectableKeys();
  }

  get accountUnconfirmedTransactions() {
    return this.rpcStore.state.accountUnconfirmedTransactions;
  }

  get accountMultisigTransactions(): Record<string, AggregatedMultisigTransactions> {
    return this.rpcStore.state.accountMultisigTransactions;
  }

  get source(): string {
    return this.transaction.inMessage.dst!;
  }

  get value(): string {
    return this.transaction.info.data.method.data.data.value;
  }

  get transactionId(): string {
    return this.transaction.info.data.method.data.data.transactionId;
  }

  get creator(): string {
    return this.transaction.info.data.method.data.data.custodian;
  }

  get knownPayload() {
    return this.transaction.info.data.knownPayload;
  }

  get txHash() {
    return this.multisigTransaction?.finalTransactionHash;
  }

  get unconfirmedTransaction(): nt.MultisigPendingTransaction | undefined {
    if (!this.source) return undefined;

    return this.accountUnconfirmedTransactions[this.source]?.[this.transactionId];
  }

  get multisigTransaction() {
    if (!this.source) return undefined;

    return this.accountMultisigTransactions[this.source]?.[this.transactionId];
  }

  get confirmations(): Set<string> {
    return new Set(this.multisigTransaction?.confirmations ?? []);
  }

  get filteredSelectableKeys() {
    return this.selectableKeys.keys.filter((key) => !this.confirmations.has(key.publicKey));
  }

  get amount(): MessageAmount {
    return !this.parsedTokenTransaction ?
      { type: 'ton_wallet', data: { amount: this.value } } :
      {
        type: 'token_wallet',
        data: {
          amount: this.parsedTokenTransaction.amount,
          attachedAmount: this.value,
          symbol: this.parsedTokenTransaction.symbol,
          decimals: this.parsedTokenTransaction.decimals,
          rootTokenContract: this.parsedTokenTransaction.rootTokenContract,
          old: this.parsedTokenTransaction.old,
        },
      };
  }

  onConfirm = async () => {
    this.fees = '';

    if (this.selectedKey != null) {
      try {
        const fees = await this.rpcStore.rpc.estimateConfirmationFees(this.source, {
          publicKey: this.selectedKey.publicKey,
          transactionId: this.transactionId,
        });

        runInAction(() => {
          this.fees = fees;
        });
      } catch (e) {
        this.logger.error(e);
      }
    }

    this.step.setEnterPassword();
  };

  onBack = () => {
    this.fees = '';
    this.error = '';
    this.step.setPreview();
  };

  onSubmit = async (keyPassword: nt.KeyPassword) => {
    const messageToPrepare: ConfirmMessageToPrepare = {
      publicKey: keyPassword.data.publicKey,
      transactionId: this.transactionId,
    };

    this.loading = true;

    try {
      const signedMessage = await this.rpcStore.rpc.prepareConfirmMessage(
        this.source,
        messageToPrepare,
        keyPassword,
      );

      this.rpcStore.rpc.sendMessage(this.source, {
        signedMessage,
        info: {
          type: 'confirm',
          data: undefined,
        },
      }).catch(this.logger.error);

      this.drawer.setPanel(undefined);
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

  setSelectedKey = (key: nt.KeyStoreEntry | undefined) => {
    this.selectedKey = key;
  };

  private async getTokenRootDetailsFromTokenWallet(transaction: SubmitTransaction) {
    const knownPayload = transaction.info.data.knownPayload;

    if (
      knownPayload?.type !== 'token_outgoing_transfer' &&
      knownPayload?.type !== 'token_swap_back'
    ) {
      return;
    }

    try {
      const recipient = extractTransactionAddress(transaction).address;
      const details = await this.rpcStore.rpc.getTokenRootDetailsFromTokenWallet(recipient);

      runInAction(() => {
        this.parsedTokenTransaction = {
          amount: knownPayload.data.tokens,
          symbol: details.symbol,
          decimals: details.decimals,
          rootTokenContract: details.address,
          old: details.version !== 'Tip3',
        };
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

interface ParsedTokenTransaction {
  amount: string
  symbol: string
  decimals: number
  rootTokenContract: string
  old: boolean
}

export enum Step {
  Preview,
  EnterPassword,
}
