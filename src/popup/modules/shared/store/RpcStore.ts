import { ControllerState, IControllerRpcClient, ListenerUnsubscriber } from '@app/popup/utils';
import { Logger } from '@app/shared';
import { createAtom, IAtom } from 'mobx';
import { inject, singleton } from 'tsyringe';
import { ControllerRpcClientToken, InitialControllerStateToken } from '../di-container';

@singleton()
export class RpcStore {
  private controllerState!: ControllerState;
  private atom: IAtom;
  private unsubscribe: ListenerUnsubscriber | null = null;

  constructor(
    @inject(InitialControllerStateToken) private initialState: ControllerState,
    @inject(ControllerRpcClientToken) public rpc: IControllerRpcClient,
    private logger: Logger,
  ) {
    this.controllerState = initialState;
    this.atom = createAtom(
      'RpcState',
      async () => {
        this.unsubscribe = rpc.onNotification(
          (data) => this.update(data.params as ControllerState),
        );
        this.update(await rpc.getState());
      },
      () => this.unsubscribe?.(),
    );
  }

  get state(): ControllerState {
    if (this.atom.reportObserved()) {
      return this.controllerState;
    }

    throw Error('RpcStore accessed outside mobx');
  }

  private update(state: ControllerState) {
    this.logger.log('[RpcStore] state updated', state);

    this.controllerState = state;
    this.atom.reportChanged();
  }
}
