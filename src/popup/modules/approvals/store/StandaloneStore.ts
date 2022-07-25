import { createAtom, IAtom } from 'mobx'
import { inject, singleton } from 'tsyringe'

import type { StandaloneController } from '@app/background'
import type { ControllerState, IControllerRpcClient, ListenerUnsubscriber } from '@app/popup/utils'
import { Logger } from '@app/shared'

import { ControllerRpcClientToken, InitialControllerStateToken } from '../di-container'

@singleton()
export class StandaloneStore {

    private controllerState!: ControllerState<StandaloneController>

    private atom: IAtom

    private unsubscribe: ListenerUnsubscriber | null = null

    constructor(
        @inject(InitialControllerStateToken) private initialState: ControllerState<StandaloneController>,
        @inject(ControllerRpcClientToken) public rpc: IControllerRpcClient<StandaloneController>,
        private logger: Logger,
    ) {
        this.controllerState = initialState
        this.atom = createAtom(
            'StandaloneStore',
            async () => {
                this.unsubscribe = rpc.onNotification(
                    data => this.update(data.params as ControllerState<StandaloneController>),
                )
                this.update(await rpc.getState())
            },
            () => this.unsubscribe?.(),
        )
    }

    get state(): ControllerState<StandaloneController> {
        if (this.atom.reportObserved()) {
            return this.controllerState
        }

        throw Error('StandaloneStore accessed outside mobx')
    }

    private update(state: ControllerState<StandaloneController>) {
        this.logger.log('[StandaloneStore] state updated', state)

        this.controllerState = state
        this.atom.reportChanged()
    }

}
