import { Mutex } from '@broxus/await-semaphore'
import { type JettonWallet, type JettonWalletTransaction, type JrpcConnection, type ProtoConnection, type RootJettonContractDetailsWithAddress, type TransactionsBatchInfo } from '@broxus/ever-wallet-wasm'
import log from 'loglevel'

import { type AsyncTimer, NekotonRpcError, RpcErrorCode, timer } from '@app/shared'

import { type ConnectionController } from '../ConnectionController'
import { BACKGROUND_POLLING_INTERVAL } from '../../constants'
import { type SseSubscriptionService, type SseUpdate } from '../../services'

export interface IJettonWalletHandler {
    onBalanceChanged(balance: string): void;
    onTransactionsFound(transactions: JettonWalletTransaction[], info: TransactionsBatchInfo): void;
}

export class JettonWalletSubscription {

    private readonly _connection: JrpcConnection | ProtoConnection

    private readonly _address: string

    private readonly _owner: string

    private readonly _jettonWallet: JettonWallet

    private readonly _details: RootJettonContractDetailsWithAddress

    private readonly _mutex: Mutex = new Mutex()

    private _releaseConnection?: () => void

    private _loopPromise?: Promise<void>

    private _refreshTimer?: AsyncTimer

    private _pollingInterval: number = BACKGROUND_POLLING_INTERVAL

    private _isRunning: boolean = false

    private _sseService?: SseSubscriptionService | null

    private _sseUnsubscribe?: () => void

    public static async subscribe(
        connectionController: ConnectionController,
        owner: string,
        rootJettonContract: string,
        handler: IJettonWalletHandler,
    ) {
        const {
            connection: {
                data: { transport, connection },
            },
            release,
        } = await connectionController.acquire()

        try {
            const details = await transport.getJettonRootDetails(rootJettonContract, owner)
            const jettonWallet = await transport.subscribeToJettonWallet(
                owner,
                rootJettonContract,
                handler,
            )

            return new JettonWalletSubscription(
                connection,
                release,
                jettonWallet,
                details,
                connectionController,
            )
        }
        catch (e: any) {
            log.error(`Owner: ${owner}, root contract: ${rootJettonContract}. Error:`, e)
            release()
            throw e
        }
    }

    private constructor(
        connection: JrpcConnection | ProtoConnection,
        release: () => void,
        jettonWallet: JettonWallet,
        details: RootJettonContractDetailsWithAddress,
        connectionController: ConnectionController
    ) {
        this._releaseConnection = release
        this._connection = connection
        this._address = jettonWallet.address
        this._owner = jettonWallet.owner
        this._jettonWallet = jettonWallet
        this._details = details

        this._sseService = connectionController.sseService
    }

    public setPollingInterval(interval: number) {
        this._pollingInterval = interval
    }

    public async start() {
        if (this._releaseConnection == null) {
            throw new NekotonRpcError(
                RpcErrorCode.INTERNAL,
                'Jetton wallet subscription must not be started after being closed',
            )
        }

        if (this._sseService) {
            this.startSse()
        }
        else {
            await this.startPolling()
        }
    }

    private startSse(): void {
        if (!this._sseService) {
            log.error('SSE service not initialized')
            return
        }

        log.trace(`JettonWalletSubscription -> SSE -> subscribing to ${this._address}`)

        this._sseUnsubscribe = this._sseService.subscribe(this._address, {
            onUpdate: (update: SseUpdate) => {
                log.trace(`JettonWalletSubscription -> SSE -> update received for ${this._address}`, update)

                this._mutex.use(async () => {
                    try {
                        await this._jettonWallet.refresh()
                    }
                    catch (e: any) {
                        log.error(
                            `Error during jetton wallet refresh via SSE (owner: ${this._owner}, root: ${this._details.address})`,
                            e,
                        )
                    }
                }).catch(err => {
                    log.error('Error in SSE update handler', err)
                })
            },

            onConnectionLost: () => {
                log.warn(`JettonWalletSubscription -> SSE connection lost for ${this._address}, starting fallback polling`)
                this.startPolling().catch(err => {
                    log.error(`Failed to start fallback polling for ${this._address}`, err)
                })
            },

            onConnectionRestored: () => {
                log.trace(`JettonWalletSubscription -> SSE connection restored for ${this._address}, stopping fallback polling`)
                this.pausePolling().catch(err => {
                    log.error(`Failed to stop fallback polling for ${this._address}`, err)
                })
            },
        })
    }

    private async startPolling() {
        if (this._loopPromise) {
            log.trace('JettonWalletSubscription -> awaiting loop promise')
            await this._loopPromise
        }

        // eslint-disable-next-line no-async-promise-executor
        this._loopPromise = new Promise<void>(async resolve => {
            this._isRunning = true
            while (this._isRunning) {
                log.trace('JettonWalletSubscription -> manual -> waiting begins')

                this._refreshTimer = timer(this._pollingInterval)
                await this._refreshTimer.promise

                log.trace('JettonWalletSubscription -> manual -> waiting ends')

                if (!this._isRunning) {
                    break
                }

                log.trace('JettonWalletSubscription -> manual -> refreshing begins')

                try {
                    await this._mutex.use(async () => {
                        await this._jettonWallet.refresh()
                    })
                }
                catch (e: any) {
                    log.error(
                        `Error during jetton wallet refresh (owner: ${this._owner}, root: ${this._details.address})`,
                        e,
                    )
                }

                log.trace('JettonWalletSubscription -> manual -> refreshing ends')
            }

            log.trace('JettonWalletSubscription -> loop finished')

            resolve()
        })
    }

    public skipRefreshTimer() {
        this._refreshTimer?.cancel()
        this._refreshTimer = undefined
    }

    public async pause() {
        this.pauseSse()
        await this.pausePolling()
    }

    private pauseSse(): void {
        if (this._sseUnsubscribe) {
            this._sseUnsubscribe()
            this._sseUnsubscribe = undefined
        }
    }

    private async pausePolling() {
        if (!this._isRunning) {
            return
        }

        this._isRunning = false

        this.skipRefreshTimer()

        await this._loopPromise
        this._loopPromise = undefined
    }

    public async stop() {
        await this.pause()

        this._sseService = null

        this._jettonWallet.free()
        this._releaseConnection?.()
        this._releaseConnection = undefined
    }

    public async use<T>(f: (wallet: JettonWallet) => Promise<T>) {
        const release = await this._mutex.acquire()
        return f(this._jettonWallet)
            .then(res => {
                release()
                return res
            })
            .catch(err => {
                release()
                throw err
            })
    }

    public get details(): RootJettonContractDetailsWithAddress {
        return this._details
    }

}
