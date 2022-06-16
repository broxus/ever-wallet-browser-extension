import { AccountsManagerPage } from '@app/popup/modules/account';
import { DeployMultisigWallet } from '@app/popup/modules/deploy';
import { MainPage } from '@app/popup/modules/main';
import { SendPage } from '@app/popup/modules/send';
import { AppConfig, DrawerPanelProvider, RpcStore, useResolve } from '@app/popup/modules/shared';
import { WelcomePage } from '@app/popup/modules/welcome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import './styles/app.scss';

function App(): JSX.Element | null {
  const rpcStore = useResolve(RpcStore);
  const config = useResolve(AppConfig);

  const accountAddresses = Object.keys(rpcStore.state.accountEntries);
  const hasAccount = accountAddresses.length > 0;
  const isFullscreen = config.activeTab?.type === 'fullscreen';
  const isNotification = config.activeTab?.type === 'notification';

  if (hasAccount && !rpcStore.state.selectedAccount) {
    return null;
  }

  if (isFullscreen) {
    if (!hasAccount || !rpcStore.state.selectedMasterKey) {
      return <WelcomePage key="welcomePage" />;
    }

    window.close();
    return null;
  }

  // if (config.group === 'approval') {
  //   if (rpcStore.state.pendingApprovalCount === 0) {
  //     closeCurrentWindow();
  //     return null;
  //   }
  //   return <ApprovalPage key="approvalPage" />;
  // }

  if (isNotification && config.group === 'deploy_multisig_wallet') {
    return <DeployMultisigWallet key="deployMultisigWallet" />;
  }

  if (isNotification && config.group === 'send') {
    return <SendPage key="sendPAge" />;
  }

  if (isNotification && config.group === 'manage_seeds') {
    return <AccountsManagerPage key="accountsManagerPage" />;
  }

  return (
    <DrawerPanelProvider key="mainPage">
      <MainPage />
    </DrawerPanelProvider>
  );
}

export default observer(App);
