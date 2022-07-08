import { closeCurrentWindow } from '@app/background';
import {
  ConnectionDataItem,
  MessageAmount,
  Nekoton,
  TokenMessageToPrepare,
  TransferMessageToPrepare,
  WalletMessageToSend,
} from '@app/models';
import { AccountabilityStore, AppConfig, createEnumField, NekotonToken, RpcStore } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  Logger,
  NATIVE_CURRENCY,
  parseCurrency,
  parseTons,
  SelectedAsset,
} from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import Decimal from 'decimal.js';
import { makeAutoObservable, runInAction } from 'mobx';
import { inject, injectable } from 'tsyringe';

@injectable()
export class PrepareMessageViewModel {
  step = createEnumField(Step, Step.EnterAddress);
  messageParams: MessageParams | undefined;
  messageToPrepare: TransferMessageToPrepare | undefined;
  selectedKey: nt.KeyStoreEntry | undefined = this.selectableKeys.keys[0];
  selectedAsset!: string;
  notifyReceiver = false;
  loading = false;
  error = '';
  fees = '';

  private _defaultAsset: SelectedAsset | undefined;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
    private config: AppConfig,
    private logger: Logger,
  ) {
    makeAutoObservable<PrepareMessageViewModel, any>(this, {
      nekoton: false,
      rpcStore: false,
      accountability: false,
      logger: false,
    });
  }

  get defaultAsset(): SelectedAsset {
    return this._defaultAsset ?? {
      type: 'ton_wallet',
      data: {
        address: this.tonWalletAsset.address,
      },
    };
  }

  set defaultAsset(value: SelectedAsset) {
    if (!value) return;

    this._defaultAsset = value;
    this.selectedAsset = value.type === 'ton_wallet' ? '' : value.data.rootTokenContract;
  }

  get masterKeysNames(): Record<string, string> {
    return this.accountability.masterKeysNames;
  }

  get selectableKeys() {
    return this.accountability.getSelectableKeys();
  }

  get knownTokens(): Record<string, nt.Symbol> {
    return this.rpcStore.state.knownTokens;
  }

  get symbol(): nt.Symbol | undefined {
    return this.knownTokens[this.selectedAsset];
  }

  get selectedConnection(): ConnectionDataItem {
    return this.rpcStore.state.selectedConnection;
  }

  get selectedAccount(): nt.AssetsList {
    return this.accountability.selectedAccount!;
  }

  get tokenWalletAssets(): nt.TokenWalletAsset[] {
    return this.selectedAccount.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? [];
  }

  get tonWalletAsset(): nt.TonWalletAsset {
    return this.selectedAccount.tonWallet;
  }

  get walletInfo(): nt.TonWalletDetails {
    return this.nekoton.getContractTypeDetails(this.tonWalletAsset.contractType);
  }

  get options(): Option[] {
    return [
      { value: '', label: NATIVE_CURRENCY },
      ...this.tokenWalletAssets.map(({ rootTokenContract }) => ({
        value: rootTokenContract,
        label: this.knownTokens[rootTokenContract]?.name || 'Unknown',
      })),
    ];
  }

  get defaultOption(): Option {
    let defaultOption = this.options[0];

    if (this.defaultAsset.type === 'token_wallet') {
      for (const option of this.options) {
        if (this.defaultAsset.data.rootTokenContract === option.value) {
          defaultOption = option;
        }
      }
    }

    return defaultOption;
  }

  get balance(): Decimal {
    return this.selectedAsset ?
      new Decimal(this.accountability.tokenWalletStates[this.selectedAsset]?.balance || '0') :
      new Decimal(this.accountability.tonWalletState?.balance || '0');
  }

  get decimals(): number | undefined {
    return this.selectedAsset ? this.symbol?.decimals : 9;
  }

  get currencyName(): string | undefined {
    return this.selectedAsset ? this.symbol?.name : NATIVE_CURRENCY;
  }

  get old(): boolean {
    if (this.selectedAsset && this.symbol) {
      return this.symbol.version !== 'Tip3';
    }

    return false;
  }

  setNotifyReceiver = (value: boolean) => {
    this.notifyReceiver = value;
  };

  onChangeAsset = (value: string) => {
    this.selectedAsset = value ?? this.selectedAsset;
  };

  onChangeKeyEntry = (value: nt.KeyStoreEntry) => {
    this.selectedKey = value;

    if (this.messageParams) {
      this.submitMessageParams({
        amount: this.messageParams.originalAmount,
        recipient: this.messageParams.recipient,
        comment: this.messageParams.comment,
      }).catch(this.logger.error);
    }
  };

  submitMessageParams = async (data: MessageFromData) => {
    if (!this.selectedKey) {
      this.error = 'Signer key not selected';
      return;
    }

    let messageParams: MessageParams;
    let messageToPrepare: TransferMessageToPrepare;

    if (!this.selectedAsset) {
      messageToPrepare = {
        publicKey: this.selectedKey.publicKey,
        recipient: this.nekoton.repackAddress(data.recipient.trim()), //shouldn't throw exceptions due to higher level validation
        amount: parseTons(data.amount.trim()),
        payload: data.comment ? this.nekoton.encodeComment(data.comment) : undefined,
      };
      messageParams = {
        amount: { type: 'ton_wallet', data: { amount: messageToPrepare.amount } },
        originalAmount: data.amount,
        recipient: messageToPrepare.recipient,
        comment: data.comment,
      };
    } else {
      if (typeof this.decimals !== 'number') {
        this.error = 'Invalid decimals';
        return;
      }

      const tokenAmount = parseCurrency(data.amount.trim(), this.decimals);
      const tokenRecipient = this.nekoton.repackAddress(data.recipient.trim());

      const internalMessage = await this.prepareTokenMessage(
        this.tonWalletAsset.address,
        this.selectedAsset,
        {
          amount: tokenAmount,
          recipient: tokenRecipient,
          payload: data.comment ? this.nekoton.encodeComment(data.comment) : undefined,
          notifyReceiver: this.notifyReceiver,
        },
      );

      messageToPrepare = {
        publicKey: this.selectedKey.publicKey,
        recipient: internalMessage.destination,
        amount: internalMessage.amount,
        payload: internalMessage.body,
      };
      messageParams = {
        amount: {
          type: 'token_wallet',
          data: {
            amount: tokenAmount,
            attachedAmount: internalMessage.amount,
            symbol: this.currencyName || '',
            decimals: this.decimals,
            rootTokenContract: this.selectedAsset,
            old: this.old,
          },
        },
        originalAmount: data.amount,
        recipient: tokenRecipient,
        comment: data.comment,
      };
    }

    this.estimateFees(messageToPrepare);

    runInAction(() => {
      this.messageToPrepare = messageToPrepare;
      this.messageParams = messageParams;
      this.step.setEnterPassword();
    });
  };

  submitPassword = async (password: nt.KeyPassword) => {
    if (!this.messageToPrepare || this.loading) {
      return;
    }

    this.error = '';
    this.loading = true;

    try {
      const messageToPrepare = this.messageToPrepare;
      const signedMessage = await this.prepareMessage(messageToPrepare, password);

      await this.trySendMessage({
        signedMessage,
        info: {
          type: 'transfer',
          data: {
            amount: messageToPrepare.amount,
            recipient: messageToPrepare.recipient,
          },
        },
      });
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

  validateAddress = (value: string) => value && this.nekoton.checkAddress(value);

  validateAmount = (value?: string) => {
    if (this.decimals == null) {
      return false;
    }
    try {
      const current = new Decimal(
        parseCurrency(value || '', this.decimals),
      );

      if (!this.selectedAsset) {
        return current.greaterThanOrEqualTo(this.walletInfo.minAmount);
      }

      return current.greaterThan(0);
    } catch (e: any) {
      return false;
    }
  };

  validateBalance = (value?: string) => {
    if (this.decimals == null) {
      return false;
    }
    try {
      const current = new Decimal(
        parseCurrency(value || '', this.decimals),
      );
      return current.lessThanOrEqualTo(this.balance);
    } catch (e: any) {
      return false;
    }
  };

  private estimateFees = async (params: TransferMessageToPrepare) => {
    this.fees = '';

    try {
      const fees = await this.rpcStore.rpc.estimateFees(this.tonWalletAsset.address, params, {});

      runInAction(() => {
        this.fees = fees;
      });
    } catch (e) {
      this.logger.error(e);
    }
  };

  private prepareMessage = (
    params: TransferMessageToPrepare,
    password: nt.KeyPassword,
  ) => this.rpcStore.rpc.prepareTransferMessage(this.tonWalletAsset.address, params, password);

  private prepareTokenMessage = (
    owner: string,
    rootTokenContract: string,
    params: TokenMessageToPrepare,
  ) => this.rpcStore.rpc.prepareTokenMessage(owner, rootTokenContract, params);

  private sendMessage = (
    message: WalletMessageToSend,
  ) => this.rpcStore.rpc.sendMessage(this.tonWalletAsset.address, message);

  private trySendMessage = async (message: WalletMessageToSend) => {
    this.sendMessage(message).catch(this.logger.error);

    if (this.config.activeTab?.type === ENVIRONMENT_TYPE_NOTIFICATION) {
      await closeCurrentWindow();
    }
  };
}

interface Option {
  value: string;
  label: string;
}

export enum Step {
  EnterAddress,
  EnterPassword,
}

export interface MessageParams {
  amount: MessageAmount;
  originalAmount: string;
  recipient: string;
  comment?: string;
}

export interface MessageFromData {
  amount: string;
  comment?: string;
  recipient: string;
}
