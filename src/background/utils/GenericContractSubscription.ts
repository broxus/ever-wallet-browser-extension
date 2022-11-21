import type nt from '@wallet/nekoton-wasm'

import { NekotonRpcError, RpcErrorCode } from '@app/models'

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

            return new GenericContractSubscription(clock, connection, release, address, contract)
        }
        catch (e: any) {
            release()
            throw e
        }
    }

}
