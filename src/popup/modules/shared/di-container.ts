import type { NekotonController } from '@app/background';
import type { Nekoton } from '@app/models';
import type { ControllerState, IControllerRpcClient } from '@app/popup/utils';
import { container, DependencyContainer, InjectionToken } from 'tsyringe';
import { AppConfig } from './models';

export async function setup(
  rpc: IControllerRpcClient<NekotonController>,
  initialState: ControllerState<NekotonController>,
  config: AppConfig,
): Promise<DependencyContainer> {
  const nekoton = await import('@wallet/nekoton-wasm') as Nekoton;

  container.registerInstance(NekotonToken, nekoton);
  container.registerInstance(ControllerRpcClientToken, rpc);
  container.registerInstance(InitialControllerStateToken, initialState);
  container.registerInstance(AppConfig, config);

  return container;
}

export const NekotonToken: InjectionToken<Nekoton> = Symbol('Nekoton');
export const ControllerRpcClientToken: InjectionToken<IControllerRpcClient<NekotonController>> = Symbol('IControllerRpcClient');
export const InitialControllerStateToken: InjectionToken<ControllerState<NekotonController>> = Symbol('ControllerState');
