import { CreateAccount, ManageSeeds } from '@app/popup/modules/account';
import { DeployWallet } from '@app/popup/modules/deploy';
import { AssetFull } from '@app/popup/modules/main/components/AssetFull';
import {
  Panel,
  SlidingPanel,
  useDrawerPanel,
  useResolve,
  useViewModel,
} from '@app/popup/modules/shared';
import { isSubmitTransaction } from '@app/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { AccountDetails } from '../AccountDetails';
import { MultisigTransaction } from '../MultisigTransaction';
import { Receive } from '../Receive';
import { TransactionInfo } from '../TransactionInfo';
import { UserAssets } from '../UserAssets';

import './MainPage.scss';
import { MainPageViewModel } from './MainPageViewModel';

const INITIAL_DATA_KEY = 'initial_data'; // TODO: remove?

export const MainPage = observer((): JSX.Element | null => {
  const drawer = useDrawerPanel();
  const vm = useViewModel(useResolve(MainPageViewModel), (vm) => {
    vm.drawer = drawer;
  });

  const scrollArea = React.useRef<HTMLDivElement>(null); // TODO: refactor?

  // TODO: remove?
  /*React.useEffect(() => {
    ;(async () => {
      const initialData = await rpc.tempStorageRemove(INITIAL_DATA_KEY);
      if (typeof initialData === 'number') {
        drawer.setPanel(initialData);
      }
    })();
  }, []);*/

  return (
    <>
      <div className="main-page" ref={scrollArea}>
        <AccountDetails />
        <UserAssets
          scrollArea={scrollArea}
          onViewTransaction={vm.showTransaction}
          onViewAsset={vm.showAsset}
        />
      </div>

      <SlidingPanel active={drawer.currentPanel !== undefined} onClose={vm.closePanel}>
        {drawer.currentPanel === Panel.RECEIVE && (
          <Receive accountName={vm.selectedAccount.name} address={vm.selectedAccount.tonWallet.address} />
        )}
        {drawer.currentPanel === Panel.MANAGE_SEEDS && <ManageSeeds />}
        {drawer.currentPanel === Panel.DEPLOY && <DeployWallet />}
        {drawer.currentPanel === Panel.CREATE_ACCOUNT && <CreateAccount />}
        {drawer.currentPanel === Panel.ASSET && vm.selectedAsset && (
          <AssetFull selectedAsset={vm.selectedAsset} />
        )}
        {drawer.currentPanel === Panel.TRANSACTION && vm.selectedTransaction &&
          (isSubmitTransaction(vm.selectedTransaction) ? (
            <MultisigTransaction transaction={vm.selectedTransaction} onOpenInExplorer={vm.openTransactionInExplorer} />
          ) : (
            <TransactionInfo transaction={vm.selectedTransaction} onOpenInExplorer={vm.openTransactionInExplorer} />
          ))}
      </SlidingPanel>
    </>
  );
});
