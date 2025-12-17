import type * as nt from '@broxus/ever-wallet-wasm'
import { encodeComment, KeyPassword, repackAddress, SignedMessage, TonWallet } from '@broxus/ever-wallet-wasm'
import { inject, singleton } from 'tsyringe'
import { runInAction } from 'mobx'


import type { MessageAmount, Nekoton } from '@app/models'

import { ConnectionStore, NekotonToken, RpcStore, Utils } from '../../shared'
import { GaslessStore } from '../../shared/store/GaslessStore'

const defaultSendTimeout = 60
const defaultMessageBounce = false

type GasslessTransferMessageToPrepare = {
    owner: string;
    rootTokenContract: string;
    publicKey: string;
    recipient: string;
    amount: Extract<MessageAmount, nt.EnumItem<'token_wallet', any>>;
    comment?: string;
    notifyReceiver?: boolean;
}

type PreparedTokenTransferGasless = {
    amount: Extract<MessageAmount, nt.EnumItem<'token_wallet', any>>;
    hash: string;
    payload: string;
    recipient: string;
    owner: string;
    rootTokenContract: string;
    publicKey: string;
    fee: string
}

@singleton()
export class GaslessTokenTransferStore {

    public preparedMessage: PreparedTokenTransferGasless | undefined

    public txErrors: nt.TransactionTreeSimulationError[] = []

    public txErrorsLoaded = false

    public feeLoaded = false

    constructor(
        private rpcStore: RpcStore,
        @inject(NekotonToken) private nekoton: Nekoton,
        private gaslessStore: GaslessStore,
        private connectionStore: ConnectionStore,
        private utils: Utils,
    ) {
        // utils.autorun(() => {
        //     if (this.preparedMessage) {
        //         // this.estimateFees(this.messageToPrepare).catch(logger.error)
        //         // this.simulateTransactionTree(this.messageToPrepare).catch(logger.error)
        //         this.simulateTransactionTree()
        //     }
        // })
    }

    public get isTon(): boolean {
        return this.connectionStore.selectedConnectionNetworkType === 'ton'
    }

    async signDataRaw(data: string, password: KeyPassword): Promise<string> {
        const output = await this.rpcStore.rpc.signDataRaw(data, password, true)
        return output.signature
    }

    async checkGasslessToken(rootTokenContract: string, contractType?: nt.ContractType): Promise<boolean> {
        const isWalletV5R1 = contractType === 'WalletV5R1'

        if (!this.gaslessStore.isAvailable) return false

        if (isWalletV5R1) {
            const config = this.gaslessStore.config
            const isGaslessAvailable = config !== null
                && config?.gasJettons.some((jetton) => jetton.masterId === rootTokenContract)

            return !!isGaslessAvailable
        }

        return false
    }

    async prepareTransfer(params: GasslessTransferMessageToPrepare): Promise<PreparedTokenTransferGasless> {
        const {
 owner, rootTokenContract, publicKey, recipient, amount,
            comment, notifyReceiver,
} = params


        const internalMessage = await this.rpcStore.rpc.prepareTokenMessage(owner, rootTokenContract, {
            recipient: repackAddress(recipient),
            amount: amount.data.amount,
            payload: comment ? encodeComment(comment, this.isTon) : undefined,
            attachedAmount: undefined,
            notifyReceiver: notifyReceiver ?? false,
        })

        const boc = await this.nekoton.encodeInternalMessage(
            undefined,
            internalMessage.destination,
            true,
            undefined,
            internalMessage.body,
            internalMessage.amount,
        )

        const response = await this.gaslessStore.estimate({
            masterId: rootTokenContract,
            internalMessages: {
                walletAddress: owner,
                walletPublicKey: publicKey,
                messages: [{ boc }],
            },
        })
        if (response.error) {
            throw new Error('failed')
        }


        const { hash, payload } = await this.rpcStore.rpc.prepareWalletV5R1MessageBody({
            address: owner,
            publicKey,
            expiration: defaultSendTimeout,
            params: response.messages.map((msg) => ({
                destination: msg.address,
                amount: msg.amount,
                body: msg.payload ?? undefined,
                bounce: defaultMessageBounce,
                stateInit: msg.stateInit ?? undefined,
            })),
            isInternalFlow: true,
        })

        const preparedMessage = {
            amount,
            hash,
            payload,
            recipient: internalMessage.destination,
            owner,
            rootTokenContract,
            publicKey,
            fee: response.commission,
        }

        runInAction(() => {
            this.preparedMessage = preparedMessage
            this.txErrorsLoaded = true
            this.feeLoaded = true
        })

        return preparedMessage
    }

    async sendMessage(transfer: PreparedTokenTransferGasless, password: KeyPassword) {
        const signature = await this.signDataRaw(Buffer.from(transfer.hash, 'hex').toString('base64'), password)

        const body = await TonWallet.appendSignatureToWalletV5R1Payload(transfer.payload, signature)

        const stateInit = await this.rpcStore.rpc.getWalletStateInit(transfer.owner, transfer.publicKey)

        const message = await this.nekoton.createRawExternalMessage(transfer.owner, stateInit, body, 60_000)

        return this._send({ transfer, message })
    }

    public async estimateFees(params: GasslessTransferMessageToPrepare): Promise<string> {
        const result = await this.prepareTransfer(params)
        return result.fee
    }

    private async _send(params: { transfer: GasslessTransferMessageToPrepare; message: SignedMessage }): Promise<void> {
        const { transfer, message } = params

        await this.gaslessStore.send({
            walletPublicKey: transfer.publicKey,
            boc: message.boc,
        })
    }

}
