import SittingMan from '@app/popup/assets/img/welcome.svg';
import { LedgerSignIn } from '@app/popup/modules/ledger';
import { Button, useResolve } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { ImportAccount } from '../ImportAccount';
import { NewAccount } from '../NewAccount';
import { Step, WelcomePageViewModel } from './WelcomePageViewModel';

import './WelcomePage.scss';

const FIRST_ACCOUNT_NAME = 'Account 1';

export const WelcomePage = observer((): JSX.Element => {
  const vm = useResolve(WelcomePageViewModel);
  const intl = useIntl();

  if (vm.selectedLocale === undefined) {
    return (
      <div className="welcome-page">
        <div className="welcome-page__content">
          <div>
            <div className="welcome-page__button">
              <Button onClick={vm.setEnglishLocale}>English</Button>
            </div>
            <div className="welcome-page__button">
              <Button design="secondary" onClick={vm.setKoreanLocale}>한국어</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {vm.step.value === Step.Welcome && (
        <div className="welcome-page">
          <div>
            <h1 className="welcome-page__header-xl">
              {intl.formatMessage({
                id: 'WELCOME_TO_EVER_WALLET',
              })}
            </h1>
            <img src={SittingMan} alt="" />
          </div>
          <br />
          <div>
            <Button className="welcome-page__button" onClick={vm.step.setCreateAccount}>
              {intl.formatMessage({ id: 'CREATE_A_NEW_WALLET' })}
            </Button>
            <Button className="welcome-page__button" design="secondary" onClick={vm.step.setImportAccount}>
              {intl.formatMessage({ id: 'SIGN_IN_WITH_SEED_PHRASE' })}
            </Button>
            <Button className="welcome-page__button" design="secondary" onClick={vm.step.setLedgerAccount}>
              {intl.formatMessage({ id: 'SIGN_IN_WITH_LEDGER' })}
            </Button>
            <hr className="welcome-page__hr" />
            <Button className="welcome-page__button" design="secondary" disabled={vm.restoreInProcess} onClick={vm.restoreFromBackup}>
              {intl.formatMessage({ id: 'RESTORE_FROM_BACKUP' })}
            </Button>
            {vm.restoreError && (
              <div className="error-message">{vm.restoreError}</div>
            )}
          </div>
        </div>
      )}

      {vm.step.value === Step.CreateAccount && (
        <NewAccount
          name={FIRST_ACCOUNT_NAME}
          onBack={vm.step.setWelcome}
        />
      )}

      {vm.step.value === Step.ImportAccount && (
        <ImportAccount
          name={FIRST_ACCOUNT_NAME}
          onBack={vm.step.setWelcome}
        />
      )}

      {vm.step.value === Step.LedgerAccount && (
        <LedgerSignIn onBack={vm.step.setWelcome} />
      )}
    </>
  );
});
