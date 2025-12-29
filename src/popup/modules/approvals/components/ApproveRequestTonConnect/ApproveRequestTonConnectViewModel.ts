import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import type { PendingApproval, TonConnectItemReply, TonProofItemReply, TonConnectItem } from '@app/models'
import { TON_CHAIN } from '@app/models/background'
import { AccountabilityStore, ConnectionStore, createEnumField, LocalizationStore, NotificationStore, RpcStore, Utils } from '@app/popup/modules/shared'
import { parseError, prepareKey } from '@app/popup/utils'
import { LedgerUtils } from '@app/popup/modules/ledger'
import { bytesToBase64, sha256 } from '@app/shared'
import { hexToBytes, TonAddress } from '@app/shared/ton/utils'

import { ApprovalStore } from '../../store'

@injectable()
export class ApproveRequestTonConnectViewModel {

    public step = createEnumField<typeof Step>(Step.SelectAccount)

    public error = ''

    public selectedAccount = this.accountability.selectedAccount

    public ledgerConnect = false

    public loading = false

    constructor(
        public ledger: LedgerUtils,
        private rpcStore: RpcStore,
        private approvalStore: ApprovalStore,
        private accountability: AccountabilityStore,
        private connectionStore: ConnectionStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
        utils.when(
            () => Object.keys(this.accountability.accounts).length !== 0,
            () => this.rpcStore.rpc.updateContractState(Object.keys(this.accountability.accountEntries)),
        )

        utils.when(
            () => this.keyEntry?.signerName === 'ledger_key',
            async () => {
                const connected = await ledger.checkLedger()
                if (!connected) {
                    runInAction(() => {
                        this.ledgerConnect = true
                    })
                }
            },
        )
    }

    public get approval(): PendingApproval<'tonConnect'> {
        return this.approvalStore.approval as PendingApproval<'tonConnect'>
    }

    public get accountContractStates(): Record<string, nt.ContractState> {
        return this.accountability.accountContractStates
    }

    public get balance(): string {
        return (this.selectedAccount && this.accountContractStates[this.selectedAccount.tonWallet.address]?.balance) ?? '0'
    }

    public get nativeCurrency(): string {
        return this.connectionStore.symbol
    }

    public setSelectedAccount(account: nt.AssetsList | undefined): void {
        this.selectedAccount = account
    }

    public get shouldShowPassword() {
        return this.approval.requestData.items.find((item) => item.name === 'ton_proof')
    }

    public get keyEntry(): nt.KeyStoreEntry | undefined {
        const publicKey = this.selectedAccount?.tonWallet.publicKey
        return publicKey ? this.accountability.storedKeys[publicKey] : undefined
    }

    private async createTonProofItem(
        addr: string,
        keyPassword: nt.KeyPassword,
        origin: string,
        payload: string,
    ): Promise<TonProofItemReply> {
        const timestamp = Math.round(Date.now() / 1000)
        const timestampBuffer = new BigInt64Array(1)
        timestampBuffer[0] = BigInt(timestamp)

        const domain = new URL(origin).host
        const domainBuffer = new TextEncoder().encode(domain)
        const domainLengthBuffer = new Int32Array(1)
        domainLengthBuffer[0] = domainBuffer.byteLength

        const address = new TonAddress(addr)

        const addressWorkchainBuffer = new Int32Array(1)
        addressWorkchainBuffer[0] = address.wc

        const addressBuffer = new Uint8Array(4 + address.hashPart.length)
        addressBuffer.set(addressWorkchainBuffer, 0)
        addressBuffer.set(address.hashPart, 4)

        const prefixBuffer = new TextEncoder().encode('ton-proof-item-v2/')
        const payloadBuffer = new TextEncoder().encode(payload)
        const messageBuffer = new Uint8Array(prefixBuffer.byteLength
            + addressBuffer.byteLength + domainLengthBuffer.byteLength
            + domainBuffer.byteLength + timestampBuffer.byteLength + payloadBuffer.byteLength)

        let offset = 0
        messageBuffer.set(prefixBuffer, offset)
        offset += prefixBuffer.byteLength
        messageBuffer.set(addressBuffer, offset)
        offset += addressBuffer.byteLength
        messageBuffer.set(domainLengthBuffer, offset)
        offset += domainLengthBuffer.byteLength
        messageBuffer.set(domainBuffer, offset)
        offset += domainBuffer.byteLength
        messageBuffer.set(new Uint8Array(timestampBuffer.buffer), offset)
        offset += 8
        messageBuffer.set(payloadBuffer, offset)

        const ffffPrefix = new Uint8Array([0xff, 0xff])
        const tonconnectPrefix = new TextEncoder().encode('ton-connect')

        const messageBufferHash = new Uint8Array(await sha256(messageBuffer))
        const bufferToSign = new Uint8Array(ffffPrefix.byteLength
            + tonconnectPrefix.byteLength
            + messageBufferHash.byteLength)
        offset = 0
        bufferToSign.set(ffffPrefix, offset)
        offset += ffffPrefix.byteLength
        bufferToSign.set(tonconnectPrefix, offset)
        offset += tonconnectPrefix.byteLength
        bufferToSign.set(messageBufferHash, offset)

        const hashBytes = new Uint8Array(await sha256(bufferToSign))
        const base64ToSign = bytesToBase64(hashBytes)
        const signedData = await this.rpcStore.rpc.signDataRaw(base64ToSign, keyPassword, undefined)

        const signatureBase64 = bytesToBase64(hexToBytes(signedData.signatureHex))


        return {
            name: 'ton_proof',
            proof: {
                timestamp, // 64-bit unix epoch time of the signing operation (seconds)
                domain: {
                    lengthBytes: domainBuffer.byteLength, // AppDomain Length
                    value: domain, // app domain name (as url part, without encoding)
                },
                signature: signatureBase64, // base64-encoded signature
                payload, // payload from the request
            },
        }
    }

    async createReplyItems(
        origin: string,
        walletStateInit: string,
        password: nt.KeyPassword,
        network: string,
    ): Promise<TonConnectItemReply[]> {
        const replyItems: TonConnectItemReply[] = []
        for (const item of this.approval.requestData.items) {
            switch (item.name) {
                case 'ton_addr':
                    replyItems.push({
                        name: 'ton_addr',
                        address: this.selectedAccount!.tonWallet.address as string,
                        network,
                        publicKey: this.selectedAccount!.tonWallet.publicKey,
                        walletStateInit,
                    })
                    break

                case 'ton_proof':
                    replyItems.push(await this.createTonProofItem(
                        this.selectedAccount!.tonWallet.address as string,
                        password,
                        origin,
                        item.payload,
                    ))
                    break

                default:
                    replyItems.push({
                        name: (item as TonConnectItem).name,
                        error: { code: 400 },
                    } as unknown as TonConnectItemReply)
            }
        }

        return replyItems
    }

    public createAutoConnectReplyItems(walletStateInit: string): TonConnectItemReply[] {
        return [
            {
                name: 'ton_addr',
                address: this.selectedAccount!.tonWallet.address as string,
                network: TON_CHAIN.MAINNET,
                publicKey: Buffer.from(this.selectedAccount?.tonWallet.publicKey as string).toString('hex'),
                walletStateInit,
            },
        ]
    }

    public async onSubmit(password?: string): Promise<void> {
        if (!this.keyEntry) {
            this.error = this.localization.intl.formatMessage({ id: 'ERROR_KEY_ENTRY_NOT_FOUND' })
            return
        }

        if (this.loading) return

        try {
            this.loading = true
            this.error = ''

            let keyPassword: nt.KeyPassword | undefined

            if (this.shouldShowPassword) {
                const wallet = this.selectedAccount!.tonWallet.contractType
                keyPassword = prepareKey({ keyEntry: this.keyEntry!, password, cache: false, wallet })
                const isValid = await this.utils.checkPassword(keyPassword)
                if (!isValid) {
                    throw new Error(this.localization.intl.formatMessage({ id: 'ERROR_INVALID_PASSWORD' }))
                }
            }

            let walletStateInit = ''
            try {
                walletStateInit = await this.rpcStore.rpc.makeStateInit(
                    this.selectedAccount?.tonWallet.address as string,
                )
            }
            catch (error) {
                console.error(error)
            }

            const networks = await this.rpcStore.rpc.getAvailableNetworks()
            const network = networks.find(item => item.id === this.connectionStore.selectedConnection.id)!

            const items = await this.createReplyItems(
                this.approval.requestData.manifestUrl,
                walletStateInit,
                keyPassword!,
                (network.description?.globalId as number).toString()
            )

            await this.approvalStore.resolvePendingApproval({
                replyItems: items,
                wallet: this.selectedAccount?.tonWallet,
            })
        }
        catch (e) {
            if (this.shouldShowPassword) {
                this.setError(parseError(e))
            }
            else {
                this.notification.error(parseError(e))
            }
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    private setError(error: string): void {
        this.error = error
    }

}

export enum Step {
    SelectAccount,
    Confirm,
}
