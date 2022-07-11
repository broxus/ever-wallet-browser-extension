import { AccountSelector } from '@app/popup/modules/account';
import {
  Button,
  ButtonGroup,
  Container,
  Content,
  ErrorMessage,
  Footer,
  Header,
  Nav,
  Notification,
  useViewModel,
} from '@app/popup/modules/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { PanelLoader } from '../PanelLoader';
import { LedgerAccountSelectorViewModel, LedgerPage } from './LedgerAccountSelectorViewModel';

import './LedgerAccountSelector.scss';

interface Props {
  theme?: 'sign-in';
  onBack: () => void;
  onSuccess: () => void;
  onError: (e: any) => void;
}

export const LedgerAccountSelector = observer(({ theme, onBack, onSuccess, onError }: Props): JSX.Element => {
  const vm = useViewModel(LedgerAccountSelectorViewModel, (vm) => {
    vm.onSuccess = onSuccess;
    vm.onError = onError;
  });
  const intl = useIntl();

  useEffect(() => {
    vm.getNewPage(LedgerPage.First);
  }, []);

  return (
    <>
      <Notification title="Could not connect your Ledger" opened={!!vm.error} onClose={vm.resetError}>
        <ErrorMessage className="ledger-account-selector__error-message">
          {vm.error}
        </ErrorMessage>
      </Notification>

      <Container className={classNames('ledger-account-selector', theme)}>
        <Header>
          <h2>{intl.formatMessage({ id: 'LEDGER_SELECT_KEYS' })}</h2>
        </Header>

        <Content className="ledger-account-selector__content">
          {vm.loading && (
            <PanelLoader
              paddings={theme !== 'sign-in'}
              transparent={theme === 'sign-in'}
            />
          )}

          <Nav
            showNext
            showPrev={vm.currentPage > 1}
            hint={intl.formatMessage(
              { id: 'LEDGER_PAGINATION_CURRENT_PAGE' },
              { value: vm.currentPage },
            )}
            onClickPrev={() => vm.getNewPage(LedgerPage.Previous)}
            onClickNext={() => vm.getNewPage(LedgerPage.Next)}
          />

          {vm.ledgerAccounts.map((account) => {
            const { publicKey, index } = account;
            const isSelected = vm.selected.has(index) || publicKey in vm.storedKeys;
            const isChecked = !vm.keysToRemove.has(publicKey) && isSelected;

            return (
              <AccountSelector
                key={publicKey}
                publicKey={publicKey}
                index={(index + 1).toString()}
                checked={isChecked}
                setChecked={(checked) => vm.setChecked(account, checked)}
              />
            );
          })}
        </Content>

        <Footer>
          <ButtonGroup vertical={theme === 'sign-in'}>
            <Button group="small" design="secondary" onClick={onBack}>
              {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
            </Button>
            <Button disabled={vm.loading} onClick={vm.saveAccounts}>
              {intl.formatMessage({ id: 'SELECT_BTN_TEXT' })}
            </Button>
          </ButtonGroup>
        </Footer>
      </Container>
    </>
  );
});
