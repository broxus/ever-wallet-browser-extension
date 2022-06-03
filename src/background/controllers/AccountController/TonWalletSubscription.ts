import type {
  ClockWithOffset,
  ContractState,
  ContractType,
  GqlConnection,
  JrpcConnection,
  MultisigPendingTransaction,
  TonWallet,
  Transaction,
} from 'nekoton-wasm';
import { ContractSubscription, IContractHandler } from '../../utils/ContractSubscription';
import { ConnectionController } from '../ConnectionController';

export interface ITonWalletHandler extends IContractHandler<Transaction> {
  onUnconfirmedTransactionsChanged(unconfirmedTransactions: MultisigPendingTransaction[]): void;

  onCustodiansChanged(custodians: string[]): void;
}

export class TonWalletSubscription extends ContractSubscription<TonWallet> {
  private readonly _contractType: ContractType;
  private readonly _handler: ITonWalletHandler;
  private _lastTransactionLt?: string;
  private _hasCustodians: boolean = false;
  private _hasUnconfirmedTransactions: boolean = false;

  public static async subscribeByAddress(
    clock: ClockWithOffset,
    connectionController: ConnectionController,
    address: string,
    handler: ITonWalletHandler,
  ) {
    const {
      connection: {
        data: { transport, connection },
      },
      release,
    } = await connectionController.acquire();

    try {
      const tonWallet = await transport.subscribeToNativeWalletByAddress(address, handler);

      return new TonWalletSubscription(
        clock,
        connection,
        release,
        tonWallet.address,
        tonWallet,
        handler,
      );
    } catch (e: any) {
      release();
      throw e;
    }
  }

  public static async subscribe(
    clock: ClockWithOffset,
    connectionController: ConnectionController,
    workchain: number,
    publicKey: string,
    contractType: ContractType,
    handler: ITonWalletHandler,
  ) {
    const {
      connection: {
        data: { transport, connection },
      },
      release,
    } = await connectionController.acquire();

    try {
      const tonWallet = await transport.subscribeToNativeWallet(
        publicKey,
        contractType,
        workchain,
        handler,
      );

      return new TonWalletSubscription(
        clock,
        connection,
        release,
        tonWallet.address,
        tonWallet,
        handler,
      );
    } catch (e: any) {
      release();
      throw e;
    }
  }

  constructor(
    clock: ClockWithOffset,
    connection: GqlConnection | JrpcConnection,
    release: () => void,
    address: string,
    contract: TonWallet,
    handler: ITonWalletHandler,
  ) {
    super(clock, connection, release, address, contract);
    this._contractType = contract.contractType;
    this._handler = handler;
  }

  protected async onBeforeRefresh(): Promise<void> {
    const isWalletV3 = this._contractType === 'WalletV3';
    if (isWalletV3 && this._hasCustodians) {
      return;
    }

    await this._contractMutex.use(async () => {
      if (!this._hasCustodians) {
        const custodians = this._contract.getCustodians();
        if (custodians !== undefined) {
          this._hasCustodians = true;
          this._handler.onCustodiansChanged(custodians);
        }
      }

      if (isWalletV3) {
        return;
      }

      const state: ContractState = this._contract.contractState();
      if (
        state.lastTransactionId?.lt === this._lastTransactionLt &&
        !this._hasUnconfirmedTransactions
      ) {
        return;
      }
      this._lastTransactionLt = state.lastTransactionId?.lt;

      const unconfirmedTransactions = this._contract.getMultisigPendingTransactions();
      this._hasUnconfirmedTransactions = unconfirmedTransactions.length > 0;
      this._handler.onUnconfirmedTransactionsChanged(unconfirmedTransactions);
    });
  }
}
