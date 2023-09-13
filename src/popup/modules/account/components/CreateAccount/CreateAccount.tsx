import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Input, Navbar, useViewModel } from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'

import { NewAccountContractType } from '../NewAccountContractType'
import { SelectAccountAddingFlow } from '../SelectAccountAddingFlow'
import { CreateAccountViewModel, Step } from './CreateAccountViewModel'
import styles from './CreateAccount.module.scss'

export const CreateAccount = observer((): JSX.Element => {
    const vm = useViewModel(CreateAccountViewModel)
    const intl = useIntl()

    return (
        <>
            {vm.step.is(Step.Index) && (
                <SelectAccountAddingFlow
                    derivedKey={vm.currentDerivedKey}
                    derivedKeys={vm.derivedKeys}
                    onChangeDerivedKey={vm.setCurrentDerivedKey}
                    onFlow={vm.onFlow}
                />
            )}

            {(vm.step.is(Step.EnterName) || vm.step.is(Step.EnterAddress)) && (
                <Container key="enterName">
                    <Header>
                        <Navbar back={vm.onBack}>
                            {vm.step.value === Step.EnterAddress
                                ? intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })
                                : intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_CREATE_LABEL' })}

                        </Navbar>
                    </Header>

                    <Content>
                        {vm.step.is(Step.EnterName) && (
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT' })}
                                {' '}
                                <a onClick={vm.onManageDerivedKey}>
                                    {intl.formatMessage({ id: 'CREATE_NEW_ACCOUNT_PANEL_COMMENT_MANAGE_KEY_LINK_LABEL' })}
                                </a>
                                .
                            </div>
                        )}

                        <Form>
                            <FormControl label={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}>
                                <Input
                                    autoFocus
                                    type="text"
                                    name="name"
                                    value={vm.name}
                                    onChange={vm.onNameChange}
                                />
                            </FormControl>
                            {vm.step.is(Step.EnterAddress) && (
                                <FormControl label={intl.formatMessage({ id: 'ENTER_MULTISIG_ADDRESS_FIELD_PLACEHOLDER' })}>
                                    <ContactInput
                                        type="address"
                                        value={vm.address}
                                        onChange={vm.onAddressChange}
                                    />
                                </FormControl>
                            )}
                            <ErrorMessage>{vm.error}</ErrorMessage>
                        </Form>
                    </Content>

                    <Footer>
                        <Button
                            disabled={vm.step.is(Step.EnterAddress) ? vm.address.length === 0 : false}
                            loading={vm.loading}
                            onClick={vm.step.is(Step.EnterAddress) ? vm.onAddExisting : vm.onNext}
                        >
                            {vm.step.is(Step.EnterAddress)
                                ? intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' })
                                : intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </Container>
            )}

            {vm.step.is(Step.SelectContractType) && (
                <NewAccountContractType
                    key="accountType"
                    availableContracts={vm.availableContracts}
                    contractType={vm.contractType}
                    error={vm.error}
                    loading={vm.loading}
                    onSelectContractType={vm.setContractType}
                    onSubmit={vm.onSubmit}
                    onBack={vm.onBack}
                />
            )}
        </>
    )
})
