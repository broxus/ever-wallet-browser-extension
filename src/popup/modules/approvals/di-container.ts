import { DependencyContainer, InjectionToken } from 'tsyringe'

import type { StandaloneController } from '@app/background'
import type { ControllerState, IControllerRpcClient } from '@app/popup/utils'

export async function setup(
    parent: DependencyContainer,
    rpc: IControllerRpcClient<StandaloneController>,
    initialState: ControllerState<StandaloneController>,
): Promise<DependencyContainer> {
    const container = parent.createChildContainer()

    container.registerInstance(ControllerRpcClientToken, rpc)
    container.registerInstance(InitialControllerStateToken, initialState)

    return container
}

export const ControllerRpcClientToken: InjectionToken<IControllerRpcClient<StandaloneController>> = Symbol('IStandaloneControllerrRpcClient')
export const InitialControllerStateToken: InjectionToken<ControllerState<StandaloneController>> = Symbol('StandaloneControllerState')
