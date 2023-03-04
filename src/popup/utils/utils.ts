import type nt from '@broxus/ever-wallet-wasm'

import type { Nekoton } from '@app/models'
import { isFromZerostate, parseAddress } from '@app/shared'

export const parseError = (error: any): string => {
    if (typeof error?.message === 'string') {
        return error.message.replace(/Error: /gi, '')
    }

    return error?.toString?.().replace(/Error: /gi, '')
}

export const formatSeed = (seed: string) => seed?.split(/[, ;\r\n\t]+/g).filter(el => el !== '')

export const ignoreCheckPassword = (password: nt.KeyPassword) => password.type !== 'ledger_key' && password.data.password == null

export type PrepareKeyParams = {
    keyEntry: nt.KeyStoreEntry
    wallet: nt.ContractType
    password?: string
    context?: nt.LedgerSignatureContext
    cache?: boolean
};

export const prepareKey = ({
    keyEntry,
    password,
    context,
    cache,
    wallet,
}: PrepareKeyParams): nt.KeyPassword => {
    switch (keyEntry.signerName) {
        case 'encrypted_key': {
            return {
                type: keyEntry.signerName,
                data: {
                    publicKey: keyEntry.publicKey,
                    password: password || undefined,
                    cache,
                },
            } as nt.KeyPassword
        }

        case 'master_key': {
            return {
                type: keyEntry.signerName,
                data: {
                    masterKey: keyEntry.masterKey,
                    publicKey: keyEntry.publicKey,
                    password: password || undefined,
                    cache,
                },
            }
        }

        case 'ledger_key': {
            return {
                type: keyEntry.signerName,
                data: {
                    publicKey: keyEntry.publicKey,
                    context: wallet === 'SetcodeMultisigWallet24h' || wallet === 'HighloadWalletV2'
                        ? undefined
                        : context,
                    wallet,
                },
            }
        }

        default:
            throw new Error(`Unknown signer name: ${keyEntry?.signerName}`)
    }
}

type PrepareLedgerSignatureContextParams = { decimals: number, asset: string, everWallet: nt.TonWalletAsset } &
    (
        | { type: 'deploy' }
        | { type: 'confirm' }
        | { type: 'transfer', custodians: string[], key: nt.KeyStoreEntry }
    )

export const prepareLedgerSignatureContext = (
    nekoton: Nekoton,
    params: PrepareLedgerSignatureContextParams,
): nt.LedgerSignatureContext => {
    const [workchainId, address] = parseAddress(params.everWallet.address)
    const requiresAddressForSignature = nekoton.requiresAddressForSignature(params.everWallet.contractType)
    const context: nt.LedgerSignatureContext = {
        asset: params.asset,
        decimals: params.decimals,
    }

    if (workchainId !== 0) {
        context.workchainId = workchainId
    }

    if (requiresAddressForSignature) {
        if (params.type === 'confirm') {
            context.address = address
        }
        else if (params.type === 'transfer') {
            if (
                isFromZerostate(params.everWallet.address)
                || (params.custodians.length > 1 && params.everWallet.publicKey !== params.key.publicKey)
            ) {
                context.address = address
            }
        }
    }

    return context
}
