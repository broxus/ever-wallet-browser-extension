import { Mutex } from '@broxus/await-semaphore';
import type {
    ClockWithOffset,
    ContractState,
    JrpcConnection,
    PendingTransaction,
    ProtoConnection,
    Transaction,
    TransactionsBatchInfo,
} from '@broxus/ever-wallet-wasm';
import log from 'loglevel';

import { type AsyncTimer, NekotonRpcError, RpcErrorCode, timer } from '@app/shared';

import { BACKGROUND_POLLING_INTERVAL } from '../constants';
import { type SseSubscriptionService, type SseUpdate } from '../services';
import type { ConnectionController } from '../controllers/ConnectionController';

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

    private readonly _connection: JrpcConnection | ProtoConnection;

    private readonly _address: string;

    protected readonly _contract: C;

    protected readonly _contractMutex: Mutex = new Mutex();

    private _releaseConnection?: () => void;

    private _loopPromise?: Promise<void>;

    private _refreshTimer?: AsyncTimer;

    private _pollingInterval: number = BACKGROUND_POLLING_INTERVAL;

    private _defaultIntensivePollingInterval: number = 2000;

    private _currentPollingMethod: IContract['pollingMethod'];

    private _isRunning: boolean = false;

    private _currentBlockId?: string;

    private _suggestedBlockId?: string;

    private _skipIteration = false;

    private _sseService?: SseSubscriptionService | null;

    private _sseUnsubscribe?: () => void;

    protected constructor(
        clock: ClockWithOffset,
        connection: JrpcConnection | ProtoConnection,
        release: () => void,
        address: string,
        contract: C,
        intensivePollingInterval: number,
        connectionController: ConnectionController,
    ) {
        this._clock = clock;
        this._releaseConnection = release;
        this._connection = connection;
        this._address = address;
        this._contract = contract;
        this._currentPollingMethod = this._contract.pollingMethod;
        this._defaultIntensivePollingInterval = intensivePollingInterval;

        this._sseService = connectionController.sseService;
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

        log.trace('ContractSubscription -> start -> started', this._sseService);

        if (this._sseService) {
            this.startSse();
        } else {
            await this.startPolling();
        }
    }

    private startSse(): void {
        if (!this._sseService) {
            log.error('SSE service not initialized');
            return;
        }

        log.trace(`ContractSubscription -> SSE -> subscribing to ${this._address}`);

        this._sseUnsubscribe = this._sseService.subscribe(this._address, {
            onUpdate: (update: SseUpdate) => {
                log.trace(`ContractSubscription -> SSE -> update received for ${this._address}`, update);

                this._contractMutex
                    .use(async () => {
                        try {
                            await this._contract.refresh(this._clock);
                            this._currentPollingMethod = this._contract.pollingMethod;
                        } catch (e: any) {
                            log.error(`Error during contract refresh via SSE (${this._address})`, e);
                        }
                    })
                    .catch((err) => {
                        log.error('Error in SSE update handler', err);
                    });
            },

            onConnectionLost: () => {
                log.warn(`ContractSubscription -> SSE connection lost for ${this._address}, starting fallback polling`);
                this.startPolling().catch((err) => {
                    log.error(`Failed to start fallback polling for ${this._address}`, err);
                });
            },

            onConnectionRestored: () => {
                log.trace(
                    `ContractSubscription -> SSE connection restored for ${this._address}, stopping fallback polling`,
                );
                this.pausePolling().catch((err) => {
                    log.error(`Failed to stop fallback polling for ${this._address}`, err);
                });
            },
        });
    }

    private async startPolling() {
        if (this._loopPromise) {
            log.trace('ContractSubscription -> awaiting loop promise');
            await this._loopPromise;
        }

        log.trace('ContractSubscription -> loop started');

        // eslint-disable-next-line no-async-promise-executor
        this._loopPromise = new Promise<void>(async (resolve) => {
            const isSimpleTransport = true;

            this._isRunning = true;
            while (this._isRunning) {
                this._skipIteration = false;

                if (isSimpleTransport || this._currentPollingMethod === 'manual') {
                    this._currentBlockId = undefined;

                    log.trace('ContractSubscription -> manual -> waiting begins');

                    this._refreshTimer = timer(
                        this._currentPollingMethod === 'manual'
                            ? this._pollingInterval
                            : this._defaultIntensivePollingInterval,
                    );
                    await this._refreshTimer.promise;

                    log.trace('ContractSubscription -> manual -> waiting ends');
                    if (this._skipIteration && !isSimpleTransport) {
                        continue;
                    }

                    if (!this._isRunning) {
                        break;
                    }

                    log.trace('ContractSubscription -> manual -> refreshing begins');

                    try {
                        this._currentPollingMethod = await this._contractMutex.use(async () => {
                            await this._contract.refresh(this._clock);
                            return this._contract.pollingMethod;
                        });
                    } catch (e: any) {
                        log.error(`Error during account refresh (${this._address})`, e);
                    }

                    log.trace('ContractSubscription -> manual -> refreshing ends');
                }
            }

            log.trace('ContractSubscription -> loop finished');

            resolve();
        });
    }

    public skipRefreshTimer(pollingMethod?: IContract['pollingMethod']) {
        if (pollingMethod != null) {
            this._currentPollingMethod = pollingMethod;
            this._skipIteration = true;
        }
        this._refreshTimer?.cancel();
        this._refreshTimer = undefined;
    }

    public async pause() {
        this.pauseSse();
        await this.pausePolling();
    }

    private pauseSse(): void {
        if (this._sseUnsubscribe) {
            this._sseUnsubscribe();
            this._sseUnsubscribe = undefined;
        }
    }

    private async pausePolling() {
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

        this._sseService = null;

        this._contract.free();
        this._releaseConnection?.();
        this._releaseConnection = undefined;
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
}
