import type nt from '@broxus/ever-wallet-wasm'

import { LedgerBridge } from './LedgerBridge'

export class LedgerConnector {

    constructor(private readonly bridge: LedgerBridge) {
    }

    async getPublicKey(account: number, handler: nt.LedgerQueryResultHandler) {
        await this.bridge
            .getPublicKey(account)
            .then(publicKey => {
                handler.onResult(publicKey)
            })
            .catch(err => {
                handler.onError(err.message)
            })
    }

    async sign(
        account: number,
        signatureId: number | undefined,
        message: Buffer,
        handler: nt.LedgerQueryResultHandler,
    ) {
        await this.bridge
            .signHash(account, signatureId, new Uint8Array(message))
            .then(signature => {
                handler.onResult(signature)
            })
            .catch(err => {
                handler.onError(err.message)
            })
    }

    async signTransaction(
        account: number,
        wallet: number,
        signatureId: number | undefined,
        message: Buffer,
        context: nt.LedgerSignatureContext,
        handler: nt.LedgerQueryResultHandler,
    ) {
        await this.bridge
            .signTransaction(account, wallet, signatureId, new Uint8Array(message), context)
            .then(signature => {
                handler.onResult(signature)
            })
            .catch(err => {
                handler.onError(err.message)
            })
    }

}
