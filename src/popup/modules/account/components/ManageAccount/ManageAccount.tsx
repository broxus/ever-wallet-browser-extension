import Arrow from '@app/popup/assets/img/arrow.svg';
import TonKey from '@app/popup/assets/img/ton-key.svg';
import {
  Button,
  ButtonGroup,
  Container,
  Content,
  CopyText,
  Footer,
  Header,
  Input,
  Switch,
  useResolve,
} from '@app/popup/modules/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { ManageAccountViewModel } from './ManageAccountViewModel';

export const ManageAccount = observer((): JSX.Element => {
  const vm = useResolve(ManageAccountViewModel);
  const intl = useIntl();

  return (
    <Container className="accounts-management">
      <Header>
        <h2>
          {intl.formatMessage({ id: 'MANAGE_ACCOUNT_PANEL_HEADER' })}
        </h2>
      </Header>

      <Content>
        <div className="accounts-management__content-header">
          {intl.formatMessage({ id: 'MANAGE_ACCOUNT_FIELD_NAME_LABEL' })}
        </div>

        <div className="accounts-management__name-field">
          <Input
            name="seed_name"
            placeholder={intl.formatMessage({
              id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER',
            })}
            type="text"
            autoComplete="off"
            value={vm.name || ''}
            onChange={vm.handleNameInputChange}
          />

          {vm.currentAccount && (vm.currentAccount.name || vm.name) && vm.currentAccount.name !== vm.name && (
            <a role="button" className="accounts-management__name-button" onClick={vm.saveName}>
              {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
            </a>
          )}
        </div>

        <div
          className={classNames('accounts-management__account-visibility', {
            'accounts-management__account-visibility-disabled': vm.isActive,
          })}
        >
          <Switch
            id="visibility"
            checked={vm.isVisible}
            onChange={vm.onToggleVisibility}
          />
          <label htmlFor="visibility">
            {intl.formatMessage({ id: 'MANAGE_ACCOUNT_VISIBILITY_SWITCHER_LABEL' })}
          </label>
        </div>

        {vm.currentAccount && (
          <div className="accounts-management__address-placeholder">
            <div className="accounts-management__address-qr-code">
              <QRCode
                value={`ton://chat/${vm.currentAccount.tonWallet.address}`}
                size={80}
              />
            </div>
            <div>
              <div className="accounts-management__address-text">
                <CopyText
                  text={vm.currentAccount.tonWallet.address}
                />
              </div>
            </div>
          </div>
        )}

        {vm.linkedKeys.length > 0 && (
          <>
            <div className="accounts-management__content-header">
              {intl.formatMessage({
                id: 'MANAGE_ACCOUNT_LIST_LINKED_KEYS_HEADING',
              })}
            </div>
            <div className="accounts-management__divider" />
            <ul className="accounts-management__list">
              {vm.linkedKeys.map((key) => (
                <li key={key.publicKey}>
                  <div
                    role="button"
                    className="accounts-management__list-item"
                    onClick={() => vm.onManageDerivedKey(key)}
                  >
                    <img src={TonKey} alt="" className="accounts-management__list-item-logo" />
                    <div className="accounts-management__list-item-title">
                      {key.name}
                    </div>
                    <img src={Arrow} alt="" style={{ height: 24, width: 24 }} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Content>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" onClick={vm.onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
          <Button onClick={vm.onSelectAccount}>
            {intl.formatMessage({ id: 'MANAGE_ACCOUNT_GO_TO_ACCOUNT_BTN_TEXT' })}
          </Button>
        </ButtonGroup>
      </Footer>
    </Container>
  );
});
