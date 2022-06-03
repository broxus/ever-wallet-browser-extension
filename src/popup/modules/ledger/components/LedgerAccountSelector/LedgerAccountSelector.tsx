import { AccountSelector } from '@app/popup/modules/account';
import { Button, Notification, useResolve, Nav } from '@app/popup/modules/shared';
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
  const vm = useResolve(LedgerAccountSelectorViewModel);
  const intl = useIntl();

  vm.onSuccess = onSuccess;
  vm.onError = onError;

  useEffect(() => {
    vm.getNewPage(LedgerPage.First);
  }, []);

  return (
    <>
      {vm.error && (
        // TODO: intl?
        <Notification title="Could not connect your Ledger" onClose={vm.resetError}>
          {vm.error}
        </Notification>
      )}

      <div className={classNames('ledger-account-selector accounts-management', theme)}>
        <header className="accounts-management__header">
          <h2 className="accounts-management__header-title">
            {intl.formatMessage({ id: 'LEDGER_SELECT_KEYS' })}
          </h2>
        </header>

        <div className="accounts-management__wrapper">
          <div className="ledger-account-selector__content">
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
          </div>

          <footer className="accounts-management__footer">
            <div className="accounts-management__footer-button-back">
              <Button design="secondary" onClick={onBack}>
                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
              </Button>
            </div>

            <Button disabled={vm.loading} onClick={vm.saveAccounts}>
              {intl.formatMessage({ id: 'SELECT_BTN_TEXT' })}
            </Button>
          </footer>
        </div>
      </div>
    </>
  );
});
