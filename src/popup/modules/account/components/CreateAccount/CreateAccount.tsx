import {
  Button,
  ButtonGroup,
  Container,
  Content,
  ErrorMessage,
  Footer,
  Header,
  Input,
  useDrawerPanel,
  useViewModel,
} from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';
import { NewAccountContractType } from '../NewAccountContractType';
import { SelectAccountAddingFlow } from '../SelectAccountAddingFlow';
import { CreateAccountViewModel, Step } from './CreateAccountViewModel';

interface Props {
  onBackFromIndex?(): void;
}

export const CreateAccount = observer(({ onBackFromIndex }: Props): JSX.Element => {
  const drawer = useDrawerPanel();
  const vm = useViewModel(CreateAccountViewModel, (vm) => {
    vm.drawer = drawer;
  });
  const intl = useIntl();

  return (
    <>
      {vm.step.value === Step.Index && (
        <SelectAccountAddingFlow
          key="selectFlow"
          derivedKey={vm.currentDerivedKey}
          derivedKeys={vm.derivedKeys}
          flow={vm.flow}
          onChangeDerivedKey={vm.setCurrentDerivedKey}
          onSelect={vm.setFlow}
          onBack={onBackFromIndex}
          onNext={vm.onNext}
        />
      )}

      {(vm.step.value === Step.EnterName || vm.step.value === Step.EnterAddress) && (
        <Container key="enterName" className="accounts-management">
          <Header>
            <h2>
              {vm.step.value === Step.EnterAddress ?
                intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_AN_EXISTING_LABEL' }) :
                intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
            </h2>
          </Header>

          <Content>
            <div className="accounts-management__content-form-rows">
              <div className="accounts-management__content-form-row">
                <Input
                  autoFocus
                  type="text"
                  name="name"
                  placeholder={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}
                  value={vm.name}
                  onChange={vm.onNameChange}
                />
              </div>
              {vm.step.value === Step.EnterAddress && (
                <div className="accounts-management__content-form-row">
                  <Input
                    autoFocus
                    type="text"
                    name="name"
                    placeholder={intl.formatMessage({ id: 'ENTER_MULTISIG_ADDRESS_FIELD_PLACEHOLDER' })}
                    value={vm.address}
                    onChange={vm.onAddressChange}
                  />
                </div>
              )}
              {vm.step.value === Step.EnterName && (
                <div className="accounts-management__content-comment">
                  {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT' })}{' '}
                  <a role="button" onClick={vm.onManageDerivedKey}>
                    {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT_MANAGE_KEY_LINK_LABEL' })}
                  </a>
                  .
                </div>
              )}
            </div>

            <ErrorMessage>{vm.error}</ErrorMessage>
          </Content>

          <Footer>
            <ButtonGroup>
              <Button group="small" design="secondary" onClick={vm.onBack}>
                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
              </Button>
              <Button
                disabled={vm.step.value === Step.EnterAddress ? vm.address.length === 0 : false}
                onClick={vm.step.value === Step.EnterAddress ? vm.onAddExisting : vm.onNext}
              >
                {vm.step.value === Step.EnterAddress ?
                  intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' }) :
                  intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
              </Button>
            </ButtonGroup>
          </Footer>
        </Container>
      )}

      {vm.step.value === Step.SelectContractType && (
        <NewAccountContractType
          key="accountType"
          availableContracts={vm.availableContracts}
          contractType={vm.contractType}
          error={vm.error}
          disabled={vm.loading}
          onSelectContractType={vm.setContractType}
          onSubmit={vm.onSubmit}
          onBack={vm.onBack}
        />
      )}
    </>
  );
});
