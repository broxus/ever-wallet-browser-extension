import { ConnectionDataItem } from '@app/models';
import { AccountabilityStore, DrawerContext, Panel, RpcStore } from '@app/popup/modules/shared';
import { SelectedAsset, transactionExplorerLink } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';
import browser from 'webextension-polyfill';

@injectable()
export class MainPageViewModel {
  selectedTransaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined;
  selectedAsset: SelectedAsset | undefined;
  drawer!: DrawerContext;

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<MainPageViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
    });
  }

  get selectedAccount(): nt.AssetsList {
    return this.accountability.selectedAccount!;
  }

  get selectedConnection(): ConnectionDataItem {
    return this.rpcStore.state.selectedConnection;
  }

  setSelectedTransaction = (transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined) => {
    this.selectedTransaction = transaction;
  };

  setSelectedAsset = (asset: SelectedAsset | undefined) => {
    this.selectedAsset = asset;
  };

  reset() {
    this.setSelectedTransaction(undefined);
    this.setSelectedAsset(undefined);
    this.accountability.reset();
  }

  closePanel = () => {
    this.reset();
    this.drawer.setPanel(undefined);
  };

  showTransaction = (transaction: nt.Transaction) => {
    this.setSelectedTransaction(transaction);
    this.drawer.setPanel(Panel.TRANSACTION);
  };

  showAsset = (selectedAsset: SelectedAsset) => {
    this.setSelectedAsset(selectedAsset);
    this.drawer.setPanel(Panel.ASSET);
  };

  openTransactionInExplorer = async (hash: string) => {
    const network = this.selectedConnection.group;

    await browser.tabs.create({
      url: transactionExplorerLink({ network, hash }),
      active: false,
    });
  };
}
