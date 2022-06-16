import { Nekoton } from '@app/models';
import { ControllerState, IControllerRpcClient } from '@app/popup/utils';
import { container, DependencyContainer, InjectionToken } from 'tsyringe';
import { AppConfig } from './models';

export async function setup(rpc: IControllerRpcClient, initialState: ControllerState, config: AppConfig): Promise<DependencyContainer> {
  const nekoton = await import('@wallet/nekoton-wasm') as Nekoton;

  container.registerInstance(NekotonToken, nekoton);
  container.registerInstance(ControllerRpcClientToken, rpc);
  container.registerInstance(InitialControllerStateToken, initialState);
  container.registerInstance(AppConfig, config);

  return container;
}

export const NekotonToken: InjectionToken<Nekoton> = Symbol('Nekoton');
export const ControllerRpcClientToken: InjectionToken<IControllerRpcClient> = Symbol('IControllerRpcClient');
export const InitialControllerStateToken: InjectionToken<ControllerState> = Symbol('ControllerState');
