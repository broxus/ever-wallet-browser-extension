import type nt from '@wallet/nekoton-wasm'

import { ContractSubscription, IContractHandler } from '../../utils/ContractSubscription'
import { ConnectionController } from '../ConnectionController'

export interface IEverWalletHandler extends IContractHandler<nt.Transaction> {
    onUnconfirmedTransactionsChanged(unconfirmedTransactions: nt.MultisigPendingTransaction[]): void;

    onCustodiansChanged(custodians: string[]): void;

    onDetailsChanged(details: nt.TonWalletDetails): void
}

export class EverWalletSubscription extends ContractSubscription<nt.TonWallet> {

    private readonly _contractType: nt.ContractType

    public static async subscribeByAddress(
        clock: nt.ClockWithOffset,
        connectionController: ConnectionController,
        address: string,
        handler: IEverWalletHandler,
    ) {
        const {
            connection: {
                data: { transport, connection },
            },
            release,
        } = await connectionController.acquire()

        try {
            const everWallet = await transport.subscribeToNativeWalletByAddress(address, handler)

            return new EverWalletSubscription(clock, connection, release, everWallet)
        }
        catch (e: any) {
            release()
            throw e
        }
    }

    public static async subscribe(
        clock: nt.ClockWithOffset,
        connectionController: ConnectionController,
        workchain: number,
        publicKey: string,
        contractType: nt.ContractType,
        handler: IEverWalletHandler,
    ) {
        const {
            connection: {
                data: { transport, connection },
            },
            release,
        } = await connectionController.acquire()

        try {
            const everWallet = await transport.subscribeToNativeWallet(
                publicKey,
                contractType,
                workchain,
                handler,
            )

            return new EverWalletSubscription(clock, connection, release, everWallet)
        }
        catch (e: any) {
            release()
            throw e
        }
    }

    constructor(
        clock: nt.ClockWithOffset,
        connection: nt.GqlConnection | nt.JrpcConnection,
        release: () => void,
        contract: nt.TonWallet,
    ) {
        super(clock, connection, release, contract.address, contract)
        this._contractType = contract.contractType
    }

}
