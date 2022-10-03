import { createAtom, IAtom } from 'mobx'
import { inject, singleton } from 'tsyringe'

import type { NekotonController } from '@app/background'
import type { ControllerState, IControllerRpcClient, ListenerUnsubscriber } from '@app/popup/utils'
import { Logger } from '@app/shared'

import { ControllerRpcClientToken, InitialControllerStateToken } from '../di-container'

@singleton()
export class RpcStore {

    private controllerState!: ControllerState<NekotonController>

    private atom: IAtom

    private unsubscribe: ListenerUnsubscriber | null = null

    constructor(
        @inject(InitialControllerStateToken) private initialState: ControllerState<NekotonController>,
        @inject(ControllerRpcClientToken) public rpc: IControllerRpcClient<NekotonController>,
        private logger: Logger,
    ) {
        this.controllerState = initialState
        this.atom = createAtom(
            'RpcState',
            async () => {
                this.unsubscribe = rpc.onNotification(
                    data => this.update(data.params as ControllerState<NekotonController>),
                )
                this.update(await rpc.getState())
            },
            () => this.unsubscribe?.(),
        )
    }

    public get state(): ControllerState<NekotonController> {
        if (this.atom.reportObserved()) {
            return this.controllerState
        }

        throw Error('RpcStore accessed outside mobx')
    }

    private update(state: ControllerState<NekotonController>) {
        this.logger.log('[RpcStore] state updated', state)

        this.controllerState = state
        this.atom.reportChanged()
    }

}
