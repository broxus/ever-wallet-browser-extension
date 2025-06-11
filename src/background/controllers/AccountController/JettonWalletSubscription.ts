import { Mutex } from '@broxus/await-semaphore'
import { GqlConnection, JettonWallet, JettonWalletTransaction, JrpcConnection, ProtoConnection, RootJettonContractDetailsWithAddress, TransactionsBatchInfo } from '@broxus/ever-wallet-wasm'
import log from 'loglevel'

import { AsyncTimer, NekotonRpcError, RpcErrorCode, timer } from '@app/shared'

import { ConnectionController } from '../ConnectionController'
import { BACKGROUND_POLLING_INTERVAL } from '../../constants'

export interface IJettonWalletHandler {
    onBalanceChanged(balance: string): void;
    onTransactionsFound(transactions: JettonWalletTransaction[], info: TransactionsBatchInfo): void;
}

export class JettonWalletSubscription {

    private readonly _connection: GqlConnection | JrpcConnection | ProtoConnection

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

            return new JettonWalletSubscription(connection, release, jettonWallet, details)
        }
        catch (e: any) {
            log.error(`Owner: ${owner}, root contract: ${rootJettonContract}. Error:`, e)
            release()
            throw e
        }
    }

    private constructor(
        connection: GqlConnection | JrpcConnection | ProtoConnection,
        release: () => void,
        jettonWallet: JettonWallet,
        details: RootJettonContractDetailsWithAddress,
    ) {
        this._releaseConnection = release
        this._connection = connection
        this._address = jettonWallet.address
        this._owner = jettonWallet.owner
        this._jettonWallet = jettonWallet
        this._details = details
    }

    public setPollingInterval(interval: number) {
        this._pollingInterval = interval
    }

    public async start() {
        if (this._releaseConnection == null) {
            throw new NekotonRpcError(
                RpcErrorCode.INTERNAL,
                'Token wallet subscription must not be started after being closed',
            )
        }

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
                        `Error during token wallet refresh (owner: ${this._owner}, root: ${this._details.address})`,
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
