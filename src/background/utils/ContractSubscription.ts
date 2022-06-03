import { NekotonRpcError, RpcErrorCode } from '@app/models';
import { Mutex } from '@broxus/await-semaphore';
import type {
  ClockWithOffset,
  ContractState,
  GqlConnection,
  JrpcConnection,
  PendingTransaction,
  Transaction,
  TransactionsBatchInfo,
} from 'nekoton-wasm';

const NEXT_BLOCK_TIMEOUT = 60; // 60s
const BACKGROUND_POLLING_INTERVAL = 60000; // 1m
const INTENSIVE_POLLING_INTERVAL = 2000; // 2s

export interface IContractHandler<T extends Transaction> {
  onMessageSent(pendingTransaction: PendingTransaction, transaction: Transaction): void;

  onMessageExpired(pendingTransaction: PendingTransaction): void;

  onStateChanged(newState: ContractState): void;

  onTransactionsFound(transactions: Array<T>, info: TransactionsBatchInfo): void;
}

export interface IContract {
  readonly pollingMethod: 'manual' | 'reliable';

  refresh(clock: ClockWithOffset): Promise<void>;

  handleBlock(blockId: string): Promise<void>;

  free(): void;
}

export class ContractSubscription<C extends IContract> {
  private readonly _clock: ClockWithOffset;
  private readonly _connection: GqlConnection | JrpcConnection;
  private readonly _address: string;
  protected readonly _contract: C;
  protected readonly _contractMutex: Mutex = new Mutex();
  private _releaseConnection?: () => void;
  private _loopPromise?: Promise<void>;
  private _refreshTimer?: [number, () => void];
  private _pollingInterval: number = BACKGROUND_POLLING_INTERVAL;
  private _currentPollingMethod: IContract['pollingMethod'];
  private _isRunning: boolean = false;
  private _currentBlockId?: string;
  private _suggestedBlockId?: string;

  protected constructor(
    clock: ClockWithOffset,
    connection: GqlConnection | JrpcConnection,
    release: () => void,
    address: string,
    contract: C,
  ) {
    this._clock = clock;
    this._releaseConnection = release;
    this._connection = connection;
    this._address = address;
    this._contract = contract;
    this._currentPollingMethod = this._contract.pollingMethod;
  }

  public setPollingInterval(interval: number) {
    this._pollingInterval = interval;
  }

  public async start() {
    if (this._releaseConnection == null) {
      throw new NekotonRpcError(
        RpcErrorCode.INTERNAL,
        'Contract subscription must not be started after being closed',
      );
    }

    if (this._loopPromise) {
      console.debug('ContractSubscription -> awaiting loop promise');
      await this._loopPromise;
    }

    console.debug('ContractSubscription -> loop started');

    // TODO: refactor
    // eslint-disable-next-line no-async-promise-executor
    this._loopPromise = new Promise<void>(async (resolve) => {
      const isSimpleTransport = !(isGqlConnection(this._connection));

      this._isRunning = true;
      let previousPollingMethod = this._currentPollingMethod;
      while (this._isRunning) {
        const pollingMethodChanged = previousPollingMethod !== this._currentPollingMethod;
        previousPollingMethod = this._currentPollingMethod;

        try {
          await this.onBeforeRefresh();
        } catch (e: any) {
          console.error(`Error before refresh for ${this._address}`, e);
        }

        if (isSimpleTransport || this._currentPollingMethod === 'manual') {
          this._currentBlockId = undefined;

          console.debug('ContractSubscription -> manual -> waiting begins');

          const pollingInterval = this._currentPollingMethod === 'manual' ? this._pollingInterval : INTENSIVE_POLLING_INTERVAL;

          await new Promise<void>((resolve) => {
            const timerHandle = self.setTimeout(() => {
              this._refreshTimer = undefined;
              resolve();
            }, pollingInterval);
            this._refreshTimer = [timerHandle, resolve];
          });

          console.debug('ContractSubscription -> manual -> waiting ends');

          if (!this._isRunning) {
            break;
          }

          console.debug('ContractSubscription -> manual -> refreshing begins');

          try {
            this._currentPollingMethod = await this._contractMutex.use(async () => {
              await this._contract.refresh(this._clock);
              return this._contract.pollingMethod;
            });
          } catch (e: any) {
            console.error(`Error during account refresh (${this._address})`, e);
          }

          console.debug('ContractSubscription -> manual -> refreshing ends');
        } else {
          // SAFETY: connection is always GqlConnection here due to `isSimpleTransport`
          const connection = this._connection as GqlConnection;

          console.debug('ContractSubscription -> reliable start');

          if (pollingMethodChanged && this._suggestedBlockId != null) {
            this._currentBlockId = this._suggestedBlockId;
          }
          this._suggestedBlockId = undefined;

          let nextBlockId: string;
          if (this._currentBlockId == null) {
            console.warn('Starting reliable connection with unknown block');

            try {
              const latestBlock = await connection.getLatestBlock(this._address);
              this._currentBlockId = latestBlock.id;
              nextBlockId = this._currentBlockId!;
            } catch (e: any) {
              console.error(`Failed to get latest block for ${this._address}`, e);
              continue;
            }
          } else {
            try {
              nextBlockId = await connection.waitForNextBlock(
                this._currentBlockId,
                this._address,
                NEXT_BLOCK_TIMEOUT,
              );
            } catch (e: any) {
              console.error(`Failed to wait for next block for ${this._address}`);
              continue; // retry
            }
          }

          try {
            this._currentPollingMethod = await this._contractMutex.use(async () => {
              await this._contract.handleBlock(nextBlockId);
              return this._contract.pollingMethod;
            });
            this._currentBlockId = nextBlockId;
          } catch (e: any) {
            console.error(`Failed to handle block for ${this._address}`, e);
          }
        }
      }

      console.debug('ContractSubscription -> loop finished');

      resolve();
    });
  }

  public skipRefreshTimer() {
    self.clearTimeout(this._refreshTimer?.[0]);
    this._refreshTimer?.[1]();
    this._refreshTimer = undefined;
  }

  public async pause() {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;

    this.skipRefreshTimer();

    await this._loopPromise;
    this._loopPromise = undefined;

    this._currentPollingMethod = await this._contractMutex.use(async () => this._contract.pollingMethod);

    this._currentBlockId = undefined;
    this._suggestedBlockId = undefined;
  }

  public async stop() {
    await this.pause();
    this._contract.free();
    this._releaseConnection?.();
    this._releaseConnection = undefined;
  }

  public async prepareReliablePolling() {
    try {
      if (isGqlConnection(this._connection)) {
        this._suggestedBlockId = (await this._connection.getLatestBlock(this._address)).id;
      }
    } catch (e: any) {
      throw new NekotonRpcError(RpcErrorCode.RESOURCE_UNAVAILABLE, e.toString());
    }
  }

  public async use<T>(f: (contract: C) => Promise<T>) {
    const release = await this._contractMutex.acquire();
    return f(this._contract)
      .then((res) => {
        release();
        return res;
      })
      .catch((err) => {
        release();
        throw err;
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async onBeforeRefresh(): Promise<void> {
  }
}

function isGqlConnection(connection: GqlConnection | JrpcConnection): connection is GqlConnection {
  return 'getLatestBlock' in connection;
}
