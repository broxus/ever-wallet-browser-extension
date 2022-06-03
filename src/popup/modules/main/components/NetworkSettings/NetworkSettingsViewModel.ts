import { ConnectionDataItem } from '@app/models';
import { RpcStore } from '@app/popup/modules/shared';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class NetworkSettingsViewModel {
  dropdownActive = false;
  networks: ConnectionDataItem[] = [];

  constructor(
    private rpcStore: RpcStore,
  ) {
    makeAutoObservable<NetworkSettingsViewModel, any>(this, {
      rpcStore: false,
    });
  }

  get selectedConnection(): ConnectionDataItem {
    return this.rpcStore.state.selectedConnection;
  }

  get pendingConnection(): ConnectionDataItem | undefined {
    return this.rpcStore.state.pendingConnection;
  }

  get networkTitle() {
    if (!this.pendingConnection || this.pendingConnection.id === this.selectedConnection.id) {
      return this.selectedConnection.name;
    }

    return `${this.pendingConnection.name}...`;
  }

  toggleDropdown = () => {
    this.dropdownActive = !this.dropdownActive;
  };

  hideDropdown = () => {
    this.dropdownActive = !this.dropdownActive;
  };

  getAvailableNetworks = async () => {
    const networks = await this.rpcStore.rpc.getAvailableNetworks();

    this.setNetworks(networks);
  };

  changeNetwork = async (network: ConnectionDataItem) => {
    if (this.selectedConnection.id === network.id) return;

    this.hideDropdown();
    await this.rpcStore.rpc.changeNetwork(network);
  };

  private setNetworks(networks: ConnectionDataItem[]) {
    this.networks = networks;
  }
}
