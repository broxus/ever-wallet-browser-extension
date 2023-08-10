import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    Button,
    Space,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Input,
    useViewModel,
} from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'

import { NewAccountContractType } from '../NewAccountContractType'
import { SelectAccountAddingFlow } from '../SelectAccountAddingFlow'
import { CreateAccountViewModel, Step } from './CreateAccountViewModel'

interface Props {
    onBackFromIndex?(): void;
}

export const CreateAccount = observer(({ onBackFromIndex }: Props): JSX.Element => {
    const vm = useViewModel(CreateAccountViewModel)
    const intl = useIntl()

    return (
        <>
            {vm.step.is(Step.Index) && (
                <SelectAccountAddingFlow
                    derivedKey={vm.currentDerivedKey}
                    derivedKeys={vm.derivedKeys}
                    onChangeDerivedKey={vm.setCurrentDerivedKey}
                    onBack={onBackFromIndex}
                    onFlow={vm.onFlow}
                />
            )}

            {(vm.step.is(Step.EnterName) || vm.step.is(Step.EnterAddress)) && (
                <Container key="enterName" className="accounts-management">
                    <Header>
                        <h2>
                            {vm.step.value === Step.EnterAddress
                                ? intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })
                                : intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}
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
                            {vm.step.is(Step.EnterAddress) && (
                                <div className="accounts-management__content-form-row">
                                    <ContactInput
                                        autoFocus
                                        type="address"
                                        placeholder={intl.formatMessage({ id: 'ENTER_MULTISIG_ADDRESS_FIELD_PLACEHOLDER' })}
                                        value={vm.address}
                                        onChange={vm.onAddressChange}
                                    />
                                </div>
                            )}
                            {vm.step.is(Step.EnterName) && (
                                <div className="accounts-management__content-comment">
                                    {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT' })}
                                    {' '}
                                    <a onClick={vm.onManageDerivedKey}>
                                        {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT_MANAGE_KEY_LINK_LABEL' })}
                                    </a>
                                    .
                                </div>
                            )}
                        </div>

                        <ErrorMessage>{vm.error}</ErrorMessage>
                    </Content>

                    <Footer>
                        <Space direction="column" gap="s">
                            <Button design="secondary" onClick={vm.onBack}>
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>
                            <Button
                                disabled={vm.step.is(Step.EnterAddress) ? vm.address.length === 0 : false}
                                onClick={vm.step.is(Step.EnterAddress) ? vm.onAddExisting : vm.onNext}
                            >
                                {vm.step.is(Step.EnterAddress)
                                    ? intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' })
                                    : intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                            </Button>
                        </Space>
                    </Footer>
                </Container>
            )}

            {vm.step.is(Step.SelectContractType) && (
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
    )
})
