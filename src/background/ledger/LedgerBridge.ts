import type * as nt from '@broxus/ever-wallet-wasm'
import { Buffer } from 'buffer'

import { LedgerRpcClient } from '@app/background/ledger/LedgerRpcClient'
import { IBridgeApi, IBridgeResponse, LedgerAccount } from '@app/models'

export class LedgerBridge {

    private readonly perPage = 5

    private page: number = 0

    constructor(private ledgerRpcClient: LedgerRpcClient) {
    }

    public getFirstPage(): Promise<LedgerAccount[]> {
        this.page = 0
        return this.__getPage(1)
    }

    public getNextPage(): Promise<LedgerAccount[]> {
        return this.__getPage(1)
    }

    public getPreviousPage(): Promise<LedgerAccount[]> {
        return this.__getPage(-1)
    }

    public getLedgerPage(page: number): Promise<LedgerAccount[]> {
        this.page = page
        return this.__getPage(1)
    }

    public async getPublicKey(account: number): Promise<Uint8Array> {
        const { success, payload, error } = await this._sendMessage('ledger-get-public-key', {
            account,
        })

        if (success && payload) {
            return Uint8Array.from(Object.values(payload.publicKey))
        }

        throw error || new Error('Unknown error')
    }

    public async signHash(account: number, chainId: number | undefined, message: Uint8Array): Promise<Uint8Array> {
        const { success, payload, error } = await this._sendMessage('ledger-sign-message', {
            account,
            message,
            chainId,
        })

        if (success && payload) {
            return Uint8Array.from(Object.values(payload.signature))
        }

        throw error || new Error('Unknown error')
    }

    public async signTransaction(
        account: number,
        wallet: number,
        chainId: number | undefined,
        message: Uint8Array,
        context: nt.LedgerSignatureContext,
    ): Promise<Uint8Array> {
        const { success, payload, error } = await this._sendMessage('ledger-sign-transaction', {
            account,
            wallet,
            message,
            context,
            originalWallet: wallet,
            chainId,
        })

        if (success && payload) {
            return Uint8Array.from(Object.values(payload.signature))
        }

        throw error || new Error('Unknown error')
    }

    public async getAddress(account: number, contract: number): Promise<Uint8Array> {
        const { success, payload, error } = await this._sendMessage('ledger-get-address', {
            account,
            contract,
        })

        if (success && payload) {
            return Uint8Array.from(Object.values(payload.address))
        }

        throw error || new Error('Unknown error')
    }

    public async close() {
        const { success, error } = await this._sendMessage('ledger-close-bridge', {})

        if (!success) {
            throw error || new Error('Unknown error')
        }
    }

    private async _getPublicKeys(from: number, to: number): Promise<LedgerAccount[]> {
        const publicKeys: LedgerAccount[] = []

        for (let i = from; i < to; i++) {
            const publicKey = await this.getPublicKey(i)
            publicKeys.push({
                publicKey: Buffer.from(publicKey).toString('hex'),
                index: i,
            })
        }

        return publicKeys
    }

    private async __getPage(increment: number): Promise<LedgerAccount[]> {
        this.page += increment

        if (this.page <= 0) {
            this.page = 1
        }
        const from = (this.page - 1) * this.perPage
        const to = from + this.perPage

        return this._getPublicKeys(from, to)
    }

    private _sendMessage<T extends keyof IBridgeApi>(action: T, params: IBridgeApi[T]['input']): Promise<IBridgeResponse<T>> {
        return this.ledgerRpcClient.sendMessage(action, params)
    }

}
