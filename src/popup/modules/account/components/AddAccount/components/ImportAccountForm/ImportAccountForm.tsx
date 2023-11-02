import { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'

import {
    Button,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Form,
    FormControl,
    Header,
    Input,
    Navbar, NekotonToken, useResolve,
} from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'
import { isNativeAddress } from '@app/shared'

interface Props {
    error?: string;
    loading?: boolean;
    defaultAccountName: string;
    onSubmit(value: ImportAccountFormValue): void;
}

export interface ImportAccountFormValue {
    name: string;
    address: string;
}

export const ImportAccountForm = memo(({ error, loading, defaultAccountName, onSubmit }: Props): JSX.Element => {
    const nekoton = useResolve(NekotonToken)
    const { register, handleSubmit, formState, control } = useForm<ImportAccountFormValue>({
        defaultValues: {
            name: defaultAccountName,
            address: '',
        },
    })
    const intl = useIntl()

    const validateAddress = useCallback(
        (value: string) => nekoton.checkAddress(value) || !isNativeAddress(value),
        [],
    )

    return (
        <Container>
            <Header>
                <Navbar back="..">
                    {intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}
                </Navbar>
            </Header>

            <Content>
                <Form id="import-account-form" onSubmit={handleSubmit(onSubmit)}>
                    <FormControl label={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}>
                        <Input
                            autoFocus
                            type="text"
                            {...register('name')}
                        />
                    </FormControl>
                    <FormControl
                        label={intl.formatMessage({ id: 'ENTER_MULTISIG_ADDRESS_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.address}
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
                                    autoFocus
                                    type="address"
                                    placeholder={intl.formatMessage({ id: 'FORM_RECEIVER_ADDRESS_PLACEHOLDER' })}
                                />
                            )}
                        />
                        <ErrorMessage>
                            {formState.errors.address?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.address?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_RECIPIENT' })}
                        </ErrorMessage>
                        <ErrorMessage>{error}</ErrorMessage>
                    </FormControl>
                </Form>
            </Content>

            <Footer>
                <Button
                    type="submit"
                    form="import-account-form"
                    disabled={!formState.isValid}
                    loading={loading}
                >
                    {intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
