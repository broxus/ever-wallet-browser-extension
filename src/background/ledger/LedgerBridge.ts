import type { LedgerSignatureContext } from '@wallet/nekoton-wasm'
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

    public async getPublicKey(account: number): Promise<Uint8Array> {
        const { success, payload, error } = await this._sendMessage('ledger-get-public-key', {
            account,
        })

        if (success && payload) {
            return Uint8Array.from(Object.values(payload.publicKey))
        }

        throw error || new Error('Unknown error')
    }

    public async signHash(account: number, message: Uint8Array, context?: LedgerSignatureContext): Promise<Uint8Array> {
        const { success, payload, error } = await this._sendMessage('ledger-sign-message', {
            account,
            message,
            context,
        })

        if (success && payload) {
            return Uint8Array.from(Object.values(payload.signature))
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
