import {
  Button,
  Container, Content,
  Footer,
  Header,
  Select,
  useDrawerPanel,
  useViewModel,
} from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { DeployReceive } from '../DeployReceive';
import { PreparedMessage } from '../PreparedMessage';
import { DeployWalletViewModel, Step, WalletType } from './DeployWalletViewModel';

import './DeployWallet.scss';

interface OptionType {
  value: WalletType;
  label: string;
}

export const DeployWallet = observer((): JSX.Element | null => {
  const drawer = useDrawerPanel();
  const vm = useViewModel(DeployWalletViewModel, (vm) => {
    vm.drawer = drawer;
  });
  const intl = useIntl();

  const walletTypesOptions = React.useMemo<OptionType[]>(() => [
    {
      label: intl.formatMessage({ id: 'DEPLOY_WALLET_DRAWER_SELECT_WALLET_STANDARD' }),
      value: WalletType.Standard,
    },
    {
      label: intl.formatMessage({ id: 'DEPLOY_WALLET_DRAWER_SELECT_WALLET_MULTISIG' }),
      value: WalletType.Multisig,
    },
  ], []);

  const getPopupContainer = useCallback((trigger: any): HTMLElement => { // eslint-disable-line arrow-body-style
    return trigger.closest('.sliding-panel__content') ??
      document.getElementById('root') ??
      document.body;
  }, []);

  return (
    <Container className="deploy-wallet">
      <Header>
        <h2>{intl.formatMessage({ id: 'DEPLOY_WALLET_DRAWER_PANEL_HEADER' })}</h2>
      </Header>

      {!vm.sufficientBalance && (
        <DeployReceive address={vm.address} totalAmount={vm.totalAmount} />
      )}

      {vm.sufficientBalance && vm.step.value === Step.DeployMessage && (
        <PreparedMessage
          keyEntry={vm.selectedDerivedKeyEntry}
          balance={vm.tonWalletState?.balance}
          fees={vm.fees}
          disabled={vm.inProcess}
          error={vm.error}
          onSubmit={vm.onSubmit}
          onBack={vm.onBack}
        />
      )}

      {vm.sufficientBalance && vm.step.value === Step.SelectType && (
        <>
          <Content>
            <div className="deploy-wallet__select">
              <Select
                options={walletTypesOptions}
                value={vm.walletType}
                getPopupContainer={getPopupContainer}
                onChange={vm.onChangeWalletType}
              />
            </div>
          </Content>

          <Footer key="standard">
            <Button onClick={vm.onNext}>
              {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
            </Button>
          </Footer>
        </>
      )}
    </Container>
  );
});
