import { ConnectionDataItem, Nekoton } from '@app/models';
import { AccountabilityStore, createEnumField, NekotonToken, RpcStore } from '@app/popup/modules/shared';
import { getScrollWidth } from '@app/popup/utils';
import { SelectedAsset, transactionExplorerLink } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable } from 'mobx';
import { inject, injectable } from 'tsyringe';
import browser from 'webextension-polyfill';

@injectable()
export class AssetFullViewModel {
  selectedAsset!: SelectedAsset;
  panel = createEnumField(Panel);
  selectedTransactionHash: string | undefined;

  constructor(
    @inject(NekotonToken) private nekoton: Nekoton,
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
  ) {
    makeAutoObservable<AssetFullViewModel, any>(this, {
      nekoton: false,
      rpcStore: false,
      accountability: false,
    });
  }

  get selectedConnection(): ConnectionDataItem {
    return this.rpcStore.state.selectedConnection;
  }

  get account(): nt.AssetsList {
    return this.accountability.selectedAccount!;
  }

  get tonWalletAsset(): nt.TonWalletAsset {
    return this.account.tonWallet;
  }

  get tonWalletState(): nt.ContractState | undefined {
    return this.accountability.tonWalletState;
  }

  get shouldDeploy(): boolean {
    if (this.selectedAsset.type === 'ton_wallet') {
      return (
        !this.tonWalletState ||
        (!this.tonWalletState.isDeployed &&
          this.nekoton.getContractTypeDetails(this.tonWalletAsset.contractType).requiresSeparateDeploy)
      );
    }

    return false;
  }

  get showSendButton() {
    return this.tonWalletState &&
      (this.balance || '0') !== '0' &&
      (this.selectedAsset.type === 'ton_wallet' ||
        this.tonWalletState.isDeployed ||
        !this.nekoton.getContractTypeDetails(this.tonWalletAsset.contractType).requiresSeparateDeploy);
  }

  get balance(): string | undefined {
    if (this.selectedAsset.type === 'ton_wallet') {
      return this.tonWalletState?.balance;
    }

    const rootTokenContract = this.selectedAsset.data.rootTokenContract;
    return this.accountability.tokenWalletStates?.[rootTokenContract]?.balance;
  }

  get transactions(): nt.TokenWalletTransaction[] | nt.TonWalletTransaction[] {
    if (this.selectedAsset.type === 'ton_wallet') {
      return this.accountability.selectedAccountTransactions;
    }

    const tokenTransactions = this.accountability.selectedAccountTokenTransactions[this.selectedAsset.data.rootTokenContract];

    return tokenTransactions
      ?.filter((transaction) => {
        const tokenTransaction = transaction as nt.TokenWalletTransaction;
        return !!tokenTransaction.info;
      }) ?? [];
  }

  get selectedTransaction(): nt.Transaction | undefined {
    if (!this.selectedTransactionHash) return undefined;

    return (this.transactions as nt.Transaction[]).find(({ id }) => id.hash === this.selectedTransactionHash);
  }

  get knownTokens(): Record<string, nt.Symbol> {
    return this.rpcStore.state.knownTokens;
  }

  get symbol() {
    if (this.selectedAsset.type === 'ton_wallet') {
      return undefined;
    }

    return this.knownTokens[this.selectedAsset.data.rootTokenContract];
  }

  closePanel = () => {
    this.selectedTransactionHash = undefined;
    this.panel.setValue(undefined);
  };

  showTransaction = (transaction: nt.Transaction) => {
    this.selectedTransactionHash = transaction.id.hash;
    this.panel.setTransaction();
  };

  openTransactionInExplorer = async (hash: string) => {
    const network = this.selectedConnection.group;

    await browser.tabs.create({
      url: transactionExplorerLink({ network, hash }),
      active: false,
    });
  };

  preloadTransactions = ({ lt, hash }: nt.TransactionId) => {
    if (this.selectedAsset.type === 'ton_wallet') {
      return this.rpcStore.rpc.preloadTransactions(this.tonWalletAsset.address, lt, hash);
    }

    const rootTokenContract = this.selectedAsset.data.rootTokenContract;
    return this.rpcStore.rpc.preloadTokenTransactions(this.tonWalletAsset.address, rootTokenContract, lt, hash);
  };

  onReceive = () => this.panel.setReceive();

  onDeploy = () => this.panel.setDeploy();

  onSend = async () => {
    await this.rpcStore.rpc.tempStorageInsert('selected_asset', this.selectedAsset);
    await this.rpcStore.rpc.openExtensionInExternalWindow({
      group: 'send',
      width: 360 + getScrollWidth() - 1,
      height: 600 + getScrollWidth() - 1,
    });

    this.panel.setValue(undefined);
  };
}

export enum Panel {
  Receive,
  Deploy,
  Transaction,
}
