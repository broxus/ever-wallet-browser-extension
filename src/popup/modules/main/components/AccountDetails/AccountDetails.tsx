import DeployIcon from '@app/popup/assets/img/deploy-icon.svg';
import NotificationsIcon from '@app/popup/assets/img/notifications.svg';
import ReceiveIcon from '@app/popup/assets/img/receive.svg';
import SendIcon from '@app/popup/assets/img/send.svg';
import { Button, ButtonGroup, Carousel, useDrawerPanel, useResolve } from '@app/popup/modules/shared';
import { convertTons } from '@app/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { AccountCard } from '../AccountCard';
import { AccountSettings } from '../AccountSettings';
import { AddNewAccountCard } from '../AddNewAccountCard';
import { NetworkSettings } from '../NetworkSettings';
import { AccountDetailsViewModel } from './AccountDetailsViewModel';

import './AccountDetails.scss';

export const AccountDetails = observer((): JSX.Element => {
  const vm = useResolve(AccountDetailsViewModel);
  const intl = useIntl();

  vm.drawer = useDrawerPanel(); // TODO: refactor

  return (
    <div className="account-details">
      <div className="account-details__top-panel">
        <div
          className="account-details__notification-bell"
          onClick={() => { /* TODO: notifications */ }}
        >
          <img src={NotificationsIcon} alt="" />
        </div>
        <NetworkSettings />
        <AccountSettings />
      </div>

      <Carousel selectedItem={vm.initialSelectedAccountIndex} onChange={vm.onSlide}>
        {vm.accounts.map(({ account, state }) => (
          <AccountCard
            key={account.tonWallet.address}
            accountName={account.name}
            address={account.tonWallet.address}
            publicKey={account.tonWallet.publicKey}
            balance={convertTons(state?.balance ?? '0').toLocaleString()}
          />
        ))}
        <AddNewAccountCard key="addSlide" onClick={vm.addAccount} />
      </Carousel>

      <ButtonGroup className="account-details__controls">
        <Button design="dark" onClick={vm.onReceive}>
          <img className="account-details__controls-icon" src={ReceiveIcon} alt="" />
          {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
        </Button>

        {vm.tonWalletState && vm.isDeployed && (
          <Button design="dark" onClick={vm.onSend}>
            <img className="account-details__controls-icon" src={SendIcon} alt="" />
            {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
          </Button>
        )}

        {vm.tonWalletState && !vm.isDeployed && (
          <Button design="dark" onClick={vm.onDeploy}>
            <img className="account-details__controls-icon" src={DeployIcon} alt="" />
            {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
});
