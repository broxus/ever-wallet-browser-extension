import { AccountabilityStore, RpcStore } from '@app/popup/modules/shared';
import { SelectedAsset } from '@app/shared';
import { makeAutoObservable } from 'mobx';
import type nt from 'nekoton-wasm';
import { injectable } from 'tsyringe';

@injectable()
export class MainPageViewModel {
  selectedTransaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined;
  selectedAsset: SelectedAsset | undefined;

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
    return this.rpcStore.state.selectedAccount!;
  }

  setSelectedTransaction(transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction | undefined) {
    this.selectedTransaction = transaction;
  }

  setSelectedAsset(asset: SelectedAsset | undefined) {
    this.selectedAsset = asset;
  }

  reset() {
    this.setSelectedTransaction(undefined);
    this.setSelectedAsset(undefined);
    this.accountability.reset();
  }
}
