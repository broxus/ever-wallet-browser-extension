import type * as nt from '@broxus/ever-wallet-wasm'

import { NekotonRpcError, RpcErrorCode } from '@app/shared'

import type { ConnectionController } from '../controllers/ConnectionController'
import { ContractSubscription, IContractHandler } from './ContractSubscription'

export class GenericContractSubscription extends ContractSubscription<nt.GenericContract> {

    public static async subscribe(
        clock: nt.ClockWithOffset,
        connectionController: ConnectionController,
        address: string,
        handler: IContractHandler<nt.Transaction>,
    ) {
        const {
            connection: {
                data: { connection, transport },
            },
            release,
        } = await connectionController.acquire()

        try {
            const contract = await transport.subscribeToGenericContract(address, handler)
            if (contract == null) {
                throw new NekotonRpcError(RpcErrorCode.INTERNAL, 'Failed to subscribe')
            }

            return new GenericContractSubscription(
                clock,
                connection,
                release,
                address,
                contract,
                connectionController.selectedConnectionPollings.intensivePollingInterval,
            )
        }
        catch (e: any) {
            release()
            throw e
        }
    }

}
