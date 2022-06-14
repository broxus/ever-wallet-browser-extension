import Arrow from '@app/popup/assets/img/arrow.svg';
import TonLogo from '@app/popup/assets/img/ton-logo.svg';
import { AccountabilityStep, Button, Container, Content, Footer, useResolve } from '@app/popup/modules/shared';
import { convertAddress } from '@app/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { CreateAccount } from '../CreateAccount';
import { ManageAccount } from '../ManageAccount';
import { ManageSeedsViewModel } from './ManageSeedsViewModel';

export const ManageSeeds = observer((): JSX.Element => {
  const vm = useResolve(ManageSeedsViewModel);
  const intl = useIntl();

  console.log(vm.step);

  return (
    <>
      {vm.step === AccountabilityStep.MANAGE_SEEDS && (
        <Container key="manageSeeds" className="accounts-management">
          <header className="accounts-management__header">
            <h2 className="accounts-management__header-title">
              {intl.formatMessage({ id: 'MANAGE_SEEDS_PANEL_HEADER' })}
            </h2>
          </header>

          <Content>
            <div className="accounts-management__content-header">
              {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_HEADING' })}
              <a role="button" className="extra" onClick={vm.addSeed}>
                {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_LINK_TEXT' })}
              </a>
            </div>

            <div className="accounts-management__divider" />

            <ul className="accounts-management__list">
              {vm.masterKeys.map((key) => {
                const isActive = vm.selectedMasterKey === key.masterKey;
                return (
                  <li key={key.masterKey}>
                    <div
                      role="button"
                      className={classNames('accounts-management__list-item', {
                        'accounts-management__list-item--active': isActive,
                      })}
                      onClick={() => vm.onManageMasterKey(key)}
                    >
                      <img
                        src={TonLogo}
                        alt=""
                        className="accounts-management__list-item-logo"
                      />
                      <div className="accounts-management__list-item-title">
                        {vm.masterKeysNames[key.masterKey] || convertAddress(key.masterKey)}
                        {isActive && intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ITEM_CURRENT' })}
                      </div>
                      <img src={Arrow} alt="" style={{ height: 24, width: 24 }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Content>

          <Footer>
            <Button disabled={vm.inProgress} onClick={vm.onBackup}>
              {intl.formatMessage({ id: 'BACKUP_ALL_BTN_TEXT' })}
            </Button>
          </Footer>
        </Container>
      )}

      {/*{vm.step === AccountabilityStep.CREATE_SEED && <CreateSeed key="createSeed" />}*/}

      {/*{vm.step === AccountabilityStep.MANAGE_SEED && <ManageSeed key="manageSeed" />}*/}

      {/*{vm.step === AccountabilityStep.CREATE_DERIVED_KEY && vm.signerName !== 'ledger_key' && (
        <CreateDerivedKey key="createDerivedKey" />
      )}*/}

      {/*{vm.step === AccountabilityStep.CREATE_DERIVED_KEY && signerName === 'ledger_key' && (
        <LedgerAccountManager onBack={backToManageSeed} />
      )}

      {vm.step === AccountabilityStep.MANAGE_DERIVED_KEY && (
        <ManageDerivedKey key="manageDerivedKey" />
      )}*/}

      {vm.step === AccountabilityStep.CREATE_ACCOUNT && (
        <CreateAccount key="createAccount" onBackFromIndex={vm.onBackInCreateAccountIndex} />
      )}

      {vm.step === AccountabilityStep.MANAGE_ACCOUNT && <ManageAccount key="manageAccount" />}
    </>
  );
});
