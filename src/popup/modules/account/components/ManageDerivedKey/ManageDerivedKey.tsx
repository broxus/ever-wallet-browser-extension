import {
  Button,
  ButtonGroup,
  Container,
  Content,
  CopyButton,
  CopyText,
  Footer,
  Header,
  Input,
  useResolve,
} from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { AccountsList } from '../AccountsList';
import { ManageDerivedKeyViewModel } from './ManageDerivedKeyViewModel';

export const ManageDerivedKey = observer((): JSX.Element => {
  const vm = useResolve(ManageDerivedKeyViewModel);
  const intl = useIntl();

  return (
    <Container className="accounts-management">
      <Header>
        <h2>
          {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_PANEL_HEADER' })}
        </h2>
      </Header>

      <Content>
        {vm.currentDerivedKey && (
          <>
            <div className="accounts-management__content-header">
              {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_PLACEHOLDER_LABEL' })}
            </div>

            <div className="accounts-management__public-key-placeholder">
              <CopyText id="copy-placeholder" text={vm.currentDerivedKey.publicKey} />
            </div>
          </>
        )}

        <div className="accounts-management__content-header">
          {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_FIELD_NAME_LABEL' })}
        </div>
        <div className="accounts-management__name-field">
          <Input
            name="seed_name"
            type="text"
            autoComplete="off"
            placeholder={intl.formatMessage({ id: 'ENTER_DERIVED_KEY_NAME_FIELD_PLACEHOLDER' })}
            value={vm.name}
            onChange={vm.onNameChange}
          />
          {vm.currentDerivedKey && (vm.currentDerivedKey.name || vm.name) && vm.currentDerivedKey.name !== vm.name && (
            <a role="button" className="accounts-management__name-button" onClick={vm.saveName}>
              {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
            </a>
          )}
        </div>

        <div className="accounts-management__content-header--lead">
          {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LISTS_ACCOUNTS_HEADER' })}
          <a role="button" className="accounts-management__create-account" onClick={vm.addAccount}>
            {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LISTS_ACCOUNTS_ADD_NEW_LINK_TEXT' })}
          </a>
        </div>

        <div className="accounts-management__content-header">
          {intl.formatMessage({
            id: 'MANAGE_DERIVED_KEY_LIST_MY_ACCOUNTS_HEADING',
          })}
        </div>
        <div className="accounts-management__divider" />

        {vm.currentDerivedKeyAccounts.length === 0 ? (
          <div className="accounts-management__list--empty">
            {intl.formatMessage({
              id: 'MANAGE_DERIVED_KEY_LIST_NO_ACCOUNTS',
            })}
          </div>
        ) : (
          <AccountsList
            items={vm.currentDerivedKeyAccounts}
            accountsVisibility={vm.accountsVisibility}
            selectedAccountAddress={vm.selectedAccountAddress}
            onClick={vm.onManageAccount}
          />
        )}

        {vm.currentDerivedKeyExternalAccounts.length > 0 && (
          <>
            <div
              className="accounts-management__content-header"
              style={{ marginTop: 20 }}
            >
              {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LIST_EXTERNAL_ACCOUNTS_HEADING' })}
            </div>
            <div className="accounts-management__divider" />

            <AccountsList
              items={vm.currentDerivedKeyExternalAccounts}
              accountsVisibility={vm.accountsVisibility}
              selectedAccountAddress={vm.selectedAccountAddress}
              onClick={vm.onManageAccount}
            />
          </>
        )}
      </Content>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" onClick={vm.onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>

          {vm.currentDerivedKey && (
            <CopyButton id="pubkey-copy-button" text={vm.currentDerivedKey.publicKey}>
              <Button>
                {intl.formatMessage({ id: 'COPY_DERIVED_KEY_BTN_TEXT' })}
              </Button>
            </CopyButton>
          )}
        </ButtonGroup>
      </Footer>
    </Container>
  );
});
