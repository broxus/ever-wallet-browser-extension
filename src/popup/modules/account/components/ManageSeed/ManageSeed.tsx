import Arrow from '@app/popup/assets/img/arrow.svg';
import TonKey from '@app/popup/assets/img/ton-key.svg';
import { Button, ButtonGroup, Container, Content, Footer, Header, Input, useViewModel } from '@app/popup/modules/shared';
import { ENVIRONMENT_TYPE_POPUP } from '@app/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { ExportSeed } from '../ExportSeed';
import { ManageSeedViewModel, Step } from './ManageSeedViewModel';

export const ManageSeed = observer((): JSX.Element => {
  const vm = useViewModel(ManageSeedViewModel);
  const intl = useIntl();

  return (
    <>
      {vm.step.is(Step.Index) && (
        <Container key="index" className="accounts-management">
          <Header>
            <h2>{intl.formatMessage({ id: 'MANAGE_SEED_PANEL_HEADER' })}</h2>
          </Header>

          <Content>
            <div className="accounts-management__content-header">
              {intl.formatMessage({ id: 'MANAGE_SEED_FIELD_NAME_LABEL' })}
            </div>

            <Input
              type="text"
              autoComplete="off"
              placeholder={intl.formatMessage({ id: 'ENTER_SEED_FIELD_PLACEHOLDER' })}
              value={vm.name || ''}
              suffix={vm.isSaveVisible && (
                <button type="button" className="accounts-management__name-button" onClick={vm.saveName}>
                  {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                </button>
              )}
              onChange={vm.onNameChange}
            />

            <div
              className="accounts-management__content-header"
              style={{ marginTop: 16 }}
            >
              {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_HEADING' })}
              {vm.signerName !== 'encrypted_key' ? (
                <a role="button" className="extra" onClick={vm.addKey}>
                  {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ADD_NEW_LINK_TEXT' })}
                </a>
              ) : (
                <small>
                  {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ONLY_ONE_NOTE' })}
                </small>
              )}
            </div>

            <div className="accounts-management__divider" />

            <ul className="accounts-management__list">
              {vm.derivedKeys.map((key) => (
                <li key={key.publicKey}>
                  <div
                    role="button"
                    className={classNames('accounts-management__list-item', {
                      _active: vm.currentDerivedKeyPubKey === key.publicKey,
                    })}
                    onClick={() => vm.onManageDerivedKey(key)}
                  >
                    <img className="accounts-management__list-item-logo" src={TonKey} alt="" />
                    <div className="accounts-management__list-item-title" title={key.name}>
                      {key.name}
                    </div>
                    <img className="accounts-management__list-item-arrow" src={Arrow} alt="" />
                  </div>
                </li>
              ))}
            </ul>
          </Content>

          <Footer>
            <ButtonGroup>
              {vm.activeTab?.type !== ENVIRONMENT_TYPE_POPUP && (
                <Button group="small" design="secondary" onClick={vm.onBack}>
                  {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                </Button>
              )}
              {vm.signerName !== 'ledger_key' && (
                <Button onClick={vm.step.setExportSeed}>
                  {intl.formatMessage({ id: 'EXPORT_SEED_BTN_TEXT' })}
                </Button>
              )}
            </ButtonGroup>
          </Footer>
        </Container>
      )}

      {vm.step.is(Step.ExportSeed) && <ExportSeed key="exportSeed" onBack={vm.onBack} />}
    </>
  );
});
