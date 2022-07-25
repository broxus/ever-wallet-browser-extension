import { Mutex } from '@broxus/await-semaphore'
import type {
    GqlConnection,
    JrpcConnection,
    Symbol,
    TokenWallet,
    TokenWalletTransaction,
    TransactionsBatchInfo,
} from '@wallet/nekoton-wasm'

import { NekotonRpcError, RpcErrorCode } from '@app/models'
import { AsyncTimer, timer } from '@app/shared'

import { ConnectionController } from '../ConnectionController'
import { BACKGROUND_POLLING_INTERVAL } from '../../constants'

export interface ITokenWalletHandler {
    onBalanceChanged(balance: string): void;

    onTransactionsFound(transactions: TokenWalletTransaction[], info: TransactionsBatchInfo): void;
}

export class TokenWalletSubscription {

    private readonly _connection: GqlConnection | JrpcConnection

    private readonly _address: string

    private readonly _owner: string

    private readonly _symbol: Symbol

    private readonly _tokenWallet: TokenWallet

    private readonly _tokenWalletMutex: Mutex = new Mutex()

    private _releaseConnection?: () => void

    private _loopPromise?: Promise<void>

    private _refreshTimer?: AsyncTimer

    private _pollingInterval: number = BACKGROUND_POLLING_INTERVAL

    private _isRunning: boolean = false

    public static async subscribe(
        connectionController: ConnectionController,
        owner: string,
        rootTokenContract: string,
        handler: ITokenWalletHandler,
    ) {
        const {
            connection: {
                data: { transport, connection },
            },
            release,
        } = await connectionController.acquire()

        try {
            const tokenWallet = await transport.subscribeToTokenWallet(
                owner,
                rootTokenContract,
                handler,
            )

            return new TokenWalletSubscription(connection, release, tokenWallet)
        }
        catch (e: any) {
            release()
            throw e
        }
    }

    private constructor(
        connection: GqlConnection | JrpcConnection,
        release: () => void,
        tokenWallet: TokenWallet,
    ) {
        this._releaseConnection = release
        this._connection = connection
        this._address = tokenWallet.address
        this._owner = tokenWallet.owner
        this._symbol = tokenWallet.symbol
        this._tokenWallet = tokenWallet
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
            console.debug('TonWalletSubscription -> awaiting loop promise')
            await this._loopPromise
        }

        // eslint-disable-next-line no-async-promise-executor
        this._loopPromise = new Promise<void>(async resolve => {
            this._isRunning = true
            while (this._isRunning) {
                console.debug('TokenWalletSubscription -> manual -> waiting begins')

                this._refreshTimer = timer(this._pollingInterval)
                await this._refreshTimer.promise

                console.debug('TokenWalletSubscription -> manual -> waiting ends')

                if (!this._isRunning) {
                    break
                }

                console.debug('TokenWalletSubscription -> manual -> refreshing begins')

                try {
                    await this._tokenWalletMutex.use(async () => {
                        await this._tokenWallet.refresh()
                    })
                }
                catch (e: any) {
                    console.error(
                        `Error during token wallet refresh (owner: ${this._owner}, root: ${this._symbol.rootTokenContract})`,
                        e,
                    )
                }

                console.debug('TokenWalletSubscription -> manual -> refreshing ends')
            }

            console.debug('TokenWalletSubscription -> loop finished')

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
        this._tokenWallet.free()
        this._releaseConnection?.()
        this._releaseConnection = undefined
    }

    public async use<T>(f: (wallet: TokenWallet) => Promise<T>) {
        const release = await this._tokenWalletMutex.acquire()
        return f(this._tokenWallet)
            .then(res => {
                release()
                return res
            })
            .catch(err => {
                release()
                throw err
            })
    }

    public get symbol() {
        return this._symbol
    }

}
