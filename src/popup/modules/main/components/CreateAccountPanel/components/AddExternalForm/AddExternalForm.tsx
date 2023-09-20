import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Input, NekotonToken, Space, useResolve } from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'
import { isNativeAddress } from '@app/shared'

interface Props {
    name: string;
    loading: boolean;
    error?: string;
    onSubmit(value: AddExternalFormValue): void;
    onBack(): void;
}

export interface AddExternalFormValue {
    name: string;
    address: string;
}

export const AddExternalForm = observer(({ name, loading, error, onSubmit, onBack }: Props): JSX.Element => {
    const nekoton = useResolve(NekotonToken)
    const intl = useIntl()
    const { register, handleSubmit, formState, control } = useForm<AddExternalFormValue>({
        defaultValues: { name, address: '' },
    })

    const validateAddress = (value: string) => !!value && (nekoton.checkAddress(value) || !isNativeAddress(value))

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'ADD_ACCOUNT_PANEL_FLOW_ADD_EXTERNAL_LABEL' })}</h2>

                <Form id="add-external-form" onSubmit={handleSubmit(onSubmit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'ENTER_ACCOUNT_NAME_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus
                            type="text"
                            {...register('name', {
                                required: true,
                                minLength: 1,
                                validate: (value) => value.trim().length > 0,
                            })}
                        />
                    </FormControl>
                    <FormControl
                        label={intl.formatMessage({ id: 'ENTER_MULTISIG_ADDRESS_FIELD_PLACEHOLDER' })}
                        invalid={!!formState.errors.address || !!error}
                    >
                        <Controller
                            name="address"
                            control={control}
                            rules={{
                                required: true,
                                validate: validateAddress,
                            }}
                            render={({ field }) => (
                                <ContactInput {...field} type="address" />
                            )}
                        />
                    </FormControl>
                    <ErrorMessage>{error}</ErrorMessage>
                </Form>
            </Content>

            <Footer>
                <Space direction="row" gap="s">
                    <Button design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button type="submit" form="add-external-form" loading={loading}>
                        {intl.formatMessage({ id: 'ADD_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
