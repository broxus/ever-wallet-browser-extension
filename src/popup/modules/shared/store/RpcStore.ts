import { createAtom, IAtom } from 'mobx'
import { inject, singleton } from 'tsyringe'

import type { RpcEvent } from '@app/models'
import type { NekotonController } from '@app/background'
import type { ControllerState, IControllerRpcClient, ListenerUnsubscriber } from '@app/popup/utils'

import { Logger } from '../utils'
import { ControllerRpcClientToken, InitialControllerStateToken } from '../di-container'

@singleton()
export class RpcStore {

    private controllerState!: ControllerState<NekotonController>

    private atom: IAtom

    private unsubscribe: ListenerUnsubscriber | null = null

    private eventListeners = new Set<RpcEventListener>()

    constructor(
        @inject(InitialControllerStateToken) private initialState: ControllerState<NekotonController>,
        @inject(ControllerRpcClientToken) public readonly rpc: IControllerRpcClient<NekotonController>,
        private logger: Logger,
    ) {
        this.controllerState = initialState
        this.atom = createAtom(
            'RpcState',
            async () => {
                this.unsubscribe = rpc.onNotification(
                    (data) => {
                        console.log(data)
                        if (data.method === 'sendUpdate') {
                            this.update(data.params as ControllerState<NekotonController>)
                        }
                        else if (data.method === 'sendEvent') {
                            this.notify(data.params as RpcEvent)
                        }
                        else {
                            logger.warn(`[RpcStore] Unknown notification method: ${data.method}`)
                        }
                    },
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

    public addEventListener(listener: RpcEventListener): () => void {
        this.eventListeners.add(listener)
        return () => this.removeEventListener(listener)
    }

    public removeEventListener(listener: RpcEventListener): void {
        this.eventListeners.delete(listener)
    }

    private update(state: ControllerState<NekotonController>): void {
        this.logger.log('[RpcStore] state updated', state)

        this.controllerState = state
        this.atom.reportChanged()
    }

    private notify(event: RpcEvent): void {
        for (const eventListener of this.eventListeners) {
            try {
                eventListener(event)
            }
            catch (e) {
                this.logger.error(e)
            }
        }
    }

}

export type RpcEventListener = (params: RpcEvent) => void
