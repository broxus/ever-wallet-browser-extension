import { container, DependencyContainer, InjectionToken } from 'tsyringe'
import init, * as nekoton from '@broxus/ever-wallet-wasm'

import type { NekotonController } from '@app/background'
import type { Nekoton } from '@app/models'
import { ConnectionConfig } from '@app/shared'
import type { ControllerState, IControllerRpcClient } from '@app/popup/utils'

import { AppConfig } from './models'

export async function setup(
    rpc: IControllerRpcClient<NekotonController>,
    initialState: ControllerState<NekotonController>,
    appConfig: AppConfig,
    connectionConfig: ConnectionConfig,
): Promise<DependencyContainer> {
    await init()

    container.registerInstance(NekotonToken, nekoton)
    container.registerInstance(ControllerRpcClientToken, rpc)
    container.registerInstance(InitialControllerStateToken, initialState)
    container.registerInstance(AppConfig, appConfig)
    container.registerInstance(ConnectionConfig, connectionConfig)

    return container
}

export const NekotonToken: InjectionToken<Nekoton> = Symbol('Nekoton')
export const ControllerRpcClientToken: InjectionToken<IControllerRpcClient<NekotonController>> = Symbol('IControllerRpcClient')
export const InitialControllerStateToken: InjectionToken<ControllerState<NekotonController>> = Symbol('ControllerState')
