import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'
import { CHAIN, ConnectItem, ConnectItemReply, TonProofItemReply } from '@tonconnect/protocol'

import { PendingApproval } from '@app/models'
import { AccountabilityStore, ConnectionStore, createEnumField, LocalizationStore, NotificationStore, RpcStore, Utils } from '@app/popup/modules/shared'
import { parseError, prepareKey } from '@app/popup/utils'
import { sha256 } from '@app/shared'
import { LedgerUtils } from '@app/popup/modules/ledger'

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
        const timestamp = Math.floor(Date.now() / 1000)
        const domain = new URL(origin).host
        const domainBytes = new TextEncoder().encode(domain)
        const domainLength = new DataView(new ArrayBuffer(4))
        domainLength.setInt32(0, domainBytes.length, true)

        const [workchain, addrHash] = addr.split(':')
        const addressWorkchain = new DataView(new ArrayBuffer(4))
        addressWorkchain.setInt32(0, parseInt(workchain, 10), true)
        const addressBuffer = new Uint8Array([...new Uint8Array(addressWorkchain.buffer), ...Buffer.from(addrHash, 'hex')])

        const timestampBuffer = new ArrayBuffer(8)
        const timestampView = new DataView(timestampBuffer)
        timestampView.setBigInt64(0, BigInt(timestamp), true)

        const messageBuffer = new Uint8Array([...new TextEncoder().encode('ton-proof-item-v2/'), ...addressBuffer, ...new Uint8Array(domainLength.buffer), ...domainBytes, ...new Uint8Array(timestampBuffer), ...new TextEncoder().encode(payload)])

        const messageHash = await sha256(messageBuffer)
        const bufferToSign = Uint8Array.from([...Buffer.from('ffff', 'hex'), ...new TextEncoder().encode('ton-connect'), ...messageHash])

        const signedData = await this.rpcStore.rpc.signDataRaw(Buffer.from(bufferToSign).toString('base64'), keyPassword, undefined)

        return {
            name: 'ton_proof',
            proof: {
                timestamp, // 64-bit unix epoch time of the signing operation (seconds)
                domain: {
                    lengthBytes: domainBytes.byteLength, // AppDomain Length
                    value: domain, // app domain name (as url part, without encoding)
                },
                signature: signedData.signature, // base64-encoded signature
                payload, // payload from the request
            },
        }
    }

    async createReplyItems(
        origin: string,
        walletStateInit: string,
        password: nt.KeyPassword,
    ): Promise<ConnectItemReply[]> {
        const replyItems: ConnectItemReply[] = []
        for (const item of this.approval.requestData.items) {
            switch (item.name) {
                case 'ton_addr':
                    replyItems.push({
                        name: 'ton_addr',
                        address: this.selectedAccount!.tonWallet.address as string,
                        network: CHAIN.MAINNET,
                        publicKey: Buffer.from(this.selectedAccount!.tonWallet.publicKey as string).toString('hex'),
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
                        name: (item as ConnectItem).name,
                        error: { code: 400 },
                    } as unknown as ConnectItemReply)
            }
        }

        return replyItems
    }

    public createAutoConnectReplyItems(walletStateInit: string): ConnectItemReply[] {
        return [
            {
                name: 'ton_addr',
                address: this.selectedAccount!.tonWallet.address as string,
                network: CHAIN.MAINNET,
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


            const items = await this.createReplyItems(
                this.approval.requestData.manifestUrl,
                walletStateInit,
                keyPassword!,
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
