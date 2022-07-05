import Arrow from '@app/popup/assets/img/arrow.svg';
import TonLogo from '@app/popup/assets/img/ton-logo.svg';
import { Button, Container, Content, Footer, Header, Switch, useResolve } from '@app/popup/modules/shared';
import { convertAddress } from '@app/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { ManageSeedsViewModel } from './ManageSeedsViewModel';

export const ManageSeeds = observer((): JSX.Element => {
  const vm = useResolve(ManageSeedsViewModel);
  const intl = useIntl();

  return (
    <Container key="manageSeeds" className="accounts-management">
      <Header>
        <h2>{intl.formatMessage({ id: 'MANAGE_SEEDS_PANEL_HEADER' })}</h2>
      </Header>

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
                    _active: isActive,
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
        <Button disabled={vm.backupInProgress} onClick={vm.onBackup}>
          {intl.formatMessage({ id: 'BACKUP_ALL_BTN_TEXT' })}
        </Button>
      </Footer>
    </Container>
  );
});
