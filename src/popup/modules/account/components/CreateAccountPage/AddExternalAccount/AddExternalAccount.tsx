import * as React from 'react'
import { useNavigate } from 'react-router'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Header, Hint, Input, Navbar, NekotonToken, useResolve } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { isNativeAddress } from '@app/shared'
import { ContactInput } from '@app/popup/modules/contacts'
import { AddExternalAccountViewModel, AddExternalFormValue } from '@app/popup/modules/account/components/CreateAccountPage/AddExternalAccount/AddExternalAccountViewModel'

export const AddExternalAccount: React.FC = observer(() => {
    const intl = useIntl()
    const navigate = useNavigate()
    const nekoton = useResolve(NekotonToken)
    const vm = useResolve(AddExternalAccountViewModel)

    const { register, handleSubmit, formState, control } = useForm<AddExternalFormValue>()

    const validateAddress = (value: string) => !!value && (nekoton.checkAddress(value) || !isNativeAddress(value))

    return (
        <Container>
            <Header>
                <Navbar back={() => navigate(-1)}>
                    {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}
                </Navbar>
            </Header>
            <Content>
                <Form id="add-external-form" onSubmit={handleSubmit(vm.onSubmit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'NAME' })}
                    >
                        <Input
                            autoFocus
                            type="text"
                            size="xs"
                            invalid={!!formState.errors.name}
                            {...register('name', {
                                required: true,
                                minLength: 1,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                    </FormControl>

                    <FormControl
                        label={intl.formatMessage({ id: 'ADDRESS_LABEL' })}
                    >
                        <Controller
                            name="address"
                            control={control}
                            rules={{
                                required: true,
                                validate: validateAddress,
                            }}
                            render={({ field }) => (
                                <ContactInput
                                    {...field}
                                    size="xs"
                                    invalid={!!formState.errors.address || !!vm.error}
                                    type="address"
                                />
                            )}
                        />
                        <Hint>
                            {intl.formatMessage({ id: 'ADD_EXTERNAL_ADDRESS_HINT' })}
                        </Hint>
                        <ErrorMessage>{vm.error}</ErrorMessage>
                    </FormControl>
                </Form>
            </Content>
            <Footer layer>
                <FooterAction>
                    <Button
                        type="submit"
                        form="add-external-form"
                        key="next"
                        design="accent"
                        loading={vm.loading}
                    >
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
