import { Nekoton } from '@app/models';
import { ControllerState, IControllerRpcClient } from '@app/popup/utils';
import { container, DependencyContainer, InjectionToken } from 'tsyringe';
import { AppConfig } from './models';

export async function setup(rpc: IControllerRpcClient, config: AppConfig): Promise<DependencyContainer> {
  const [nekoton, state] = await Promise.all([
    import('nekoton-wasm') as Promise<Nekoton>,
    rpc.getState(),
  ]);

  container.registerInstance(NekotonToken, nekoton);
  container.registerInstance(ControllerRpcClientToken, rpc);
  container.registerInstance(InitialControllerStateToken, state);
  container.registerInstance(AppConfig, config);

  return container;
}

export const NekotonToken: InjectionToken<Nekoton> = Symbol('Nekoton');
export const ControllerRpcClientToken: InjectionToken<IControllerRpcClient> = Symbol('IControllerRpcClient');
export const InitialControllerStateToken: InjectionToken<ControllerState> = Symbol('ControllerState');
