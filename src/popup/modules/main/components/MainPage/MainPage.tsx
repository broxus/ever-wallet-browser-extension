import { Panel, SlidingPanel, useDrawerPanel, useResolve } from '@app/popup/modules/shared';
import { SelectedAsset } from '@app/shared';
import { observer } from 'mobx-react-lite';
import type nt from 'nekoton-wasm';
import React, { useCallback } from 'react';
import { AccountDetails } from '../AccountDetails';
import { Receive } from '../Receive';
import { MainPageViewModel } from './MainPageViewModel';

import './MainPage.scss';

const INITIAL_DATA_KEY = 'initial_data'; // TODO: remove?

export const MainPage = observer((): JSX.Element | null => {
  const vm = useResolve(MainPageViewModel);
  const drawer = useDrawerPanel();

  const scrollArea = React.useRef<HTMLDivElement>(null); // TODO: refactor?

  const closePanel = useCallback(() => {
    vm.reset();
    drawer.setPanel(undefined);
  }, []);

  const showTransaction = useCallback((transaction: nt.Transaction) => {
    vm.setSelectedTransaction(transaction);
    drawer.setPanel(Panel.TRANSACTION);
  }, []);

  const showAsset = useCallback((selectedAsset: SelectedAsset) => {
    vm.setSelectedAsset(selectedAsset);
    drawer.setPanel(Panel.ASSET);
  }, []);

  // TODO: remove?
  /*React.useEffect(() => {
    ;(async () => {
      const initialData = await rpc.tempStorageRemove(INITIAL_DATA_KEY);
      if (typeof initialData === 'number') {
        drawer.setPanel(initialData);
      }
    })();
  }, []);*/

  // TODO: refactor, move to <UserAssets />
  // const { externalAccounts, knownTokens, selectedAccount, selectedConnection, storedKeys } =
  //   rpcState.state;

  // const accountName = vm.selectedAccount.name as string;
  // const accountAddress = vm.selectedAccount.tonWallet.address as string;
  // const accountPublicKey = vm.selectedAccount.tonWallet.publicKey as string;
  //
  // const selectedKeys = React.useMemo(() => {
  //   let keys: nt.KeyStoreEntry[] = [storedKeys[accountPublicKey]];
  //   const externals = externalAccounts.find((account) => account.address === accountAddress);
  //
  //   if (externals !== undefined) {
  //     keys = keys.concat(externals.externalIn.map((key) => storedKeys[key]));
  //   }
  //
  //   return keys.filter((e) => e);
  // }, [accountability.selectedAccount, externalAccounts, storedKeys]);
  //
  // const tonWalletAsset = accountability.selectedAccount.tonWallet;
  // const tokenWalletAssets = accountability.selectedAccount.additionalAssets[selectedConnection.group]?.tokenWallets || [];
  // const tonWalletState = rpcState.state.accountContractStates[accountAddress] as nt.ContractState | undefined;
  // const tokenWalletStates = rpcState.state.accountTokenStates[accountAddress] || {};
  // const transactions = rpcState.state.accountTransactions[accountAddress] || [];

  return (
    <>
      <div className="main-page" ref={scrollArea}>
        <AccountDetails />
        {/*<UserAssets*/}
        {/*  tonWalletAsset={tonWalletAsset}*/}
        {/*  tokenWalletAssets={tokenWalletAssets}*/}
        {/*  tonWalletState={tonWalletState}*/}
        {/*  tokenWalletStates={tokenWalletStates}*/}
        {/*  knownTokens={knownTokens}*/}
        {/*  transactions={transactions}*/}
        {/*  scrollArea={scrollArea}*/}
        {/*  updateTokenWallets={async (params) =>*/}
        {/*    await rpc.updateTokenWallets(accountAddress, params)*/}
        {/*  }*/}
        {/*  onViewTransaction={showTransaction}*/}
        {/*  onViewAsset={showAsset}*/}
        {/*  preloadTransactions={({ lt, hash }) =>*/}
        {/*    rpc.preloadTransactions(accountAddress, lt, hash)*/}
        {/*  }*/}
        {/*/>*/}
      </div>

      <SlidingPanel active={drawer.currentPanel !== undefined} onClose={closePanel}>
        {drawer.currentPanel === Panel.RECEIVE && (
          <Receive accountName={vm.selectedAccount.name} address={vm.selectedAccount.tonWallet.address} />
        )}
        {/*{drawer.currentPanel === Panel.MANAGE_SEEDS && <ManageSeeds />}*/}
        {/*{drawer.currentPanel === Panel.DEPLOY && <DeployWallet />}*/}
        {/*{drawer.currentPanel === Panel.CREATE_ACCOUNT && <CreateAccount />}*/}
        {/*{drawer.currentPanel === Panel.ASSET && selectedAsset && (*/}
        {/*  <AssetFull*/}
        {/*    tokenWalletStates={tokenWalletStates}*/}
        {/*    selectedKeys={selectedKeys}*/}
        {/*    selectedAsset={selectedAsset}*/}
        {/*  />*/}
        {/*)}*/}
        {/*{drawer.currentPanel === Panel.TRANSACTION &&*/}
        {/*  selectedTransaction != null &&*/}
        {/*  (isSubmitTransaction(selectedTransaction) ? (*/}
        {/*    <MultisigTransactionSign transaction={selectedTransaction} />*/}
        {/*  ) : (*/}
        {/*    <TransactionInfo transaction={selectedTransaction} />*/}
        {/*  ))}*/}
      </SlidingPanel>
    </>
  );
});
