import { MainPage } from '@app/popup/modules/main';
import { AppConfig, DrawerPanelProvider, RpcStore, useResolve } from '@app/popup/modules/shared';
import { WelcomePage } from '@app/popup/modules/welcome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import './styles/app.scss';

function App(): JSX.Element | null {
  const rpcStore = useResolve(RpcStore);
  const config = useResolve(AppConfig);

  if (!rpcStore.state) return null;

  const accountAddresses = Object.keys(rpcStore.state.accountEntries);

  const hasActiveTab = config.activeTab != null;
  const hasAccount = accountAddresses.length > 0;
  const hasTabData = config.activeTab?.data != null;
  const isFullscreen = config.activeTab?.type === 'fullscreen';
  const isNotification = config.activeTab?.type === 'notification';

  if (accountAddresses.length > 0 && !rpcStore.state.selectedAccount) {
    return null;
  }

  if (!hasActiveTab || (hasAccount && isFullscreen && !hasTabData)) {
    window.close();
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
  //
  // if (isNotification && config.group === 'deploy_multisig_wallet') {
  //   return <DeployMultisigWallet key="deployMultisigWallet" />;
  // }
  //
  // if (isNotification && config.group === 'send') {
  //   return <SendPage key="sendPAge" />;
  // }
  //
  // if (isNotification && config.group === 'manage_seeds') {
  //   return <AccountsManagerPage key="accountsManagerPage" />;
  // }

  return (
    <DrawerPanelProvider key="mainPage">
      <MainPage />
    </DrawerPanelProvider>
  );
}

export default observer(App);
