import { AccountabilityStore, DrawerContext, Panel, RpcStore } from '@app/popup/modules/shared';
import { getScrollWidth } from '@app/popup/utils';
import { makeAutoObservable } from 'mobx';
import type nt from 'nekoton-wasm';
import { injectable } from 'tsyringe';

@injectable()
export class AccountDetailsViewModel {
  drawer!: DrawerContext;

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<AccountDetailsViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
    });
  }

  get tonWalletState(): nt.ContractState | undefined {
    return this.accountability.tonWalletState;
  }

  get accounts(): Array<{ account: nt.AssetsList, state: nt.ContractState | undefined }> {
    return this.accountability.accounts.map((account) => ({
      account,
      state: this.accountability.accountContractStates[account.tonWallet.address],
    }));
  }

  get initialSelectedAccountIndex(): number {
    const index = this.accountability.accounts.findIndex(
      (account) => account.tonWallet.address === this.accountability.selectedAccountAddress,
    );

    return index >= 0 ? index : 0;
  }

  get isDeployed(): boolean {
    return this.tonWalletState?.isDeployed || this.accountability.selectedAccount?.tonWallet.contractType === 'WalletV3';
  }

  onReceive = () => this.drawer.setPanel(Panel.RECEIVE);

  onDeploy = () => this.drawer.setPanel(Panel.DEPLOY);

  onSend = async () => {
    await this.rpcStore.rpc.openExtensionInExternalWindow({
      group: 'send',
      width: 360 + getScrollWidth() - 1,
      height: 600 + getScrollWidth() - 1,
    });
  };

  onSlide = async (index: number) => {
    // if not a last slide
    if (this.accountability.accounts.length === index) {
      const account = this.accountability.accounts[index - 1];

      if (
        account === undefined ||
        account?.tonWallet.address === this.accountability.selectedAccountAddress
      ) {
        return;
      }

      await this.rpcStore.rpc.selectAccount(account.tonWallet.address);
    }

    const account = this.accountability.accounts[index];

    if (
      account === undefined ||
      account?.tonWallet.address === this.accountability.selectedAccountAddress
    ) {
      return;
    }

    await this.rpcStore.rpc.selectAccount(account.tonWallet.address);
  };

  addAccount = () => {
    const masterKey = this.accountability.masterKeys.find(
      (key) => key.masterKey === this.accountability.selectedMasterKey,
    );

    this.accountability.setCurrentMasterKey(masterKey);
    this.drawer.setPanel(Panel.CREATE_ACCOUNT);
  };
}
