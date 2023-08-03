import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Input, useViewModel } from '@app/popup/modules/shared'
import { RawContact } from '@app/models'

import { AddContactViewModel, FormValue } from './AddContactViewModel'

interface Props {
    contact?: RawContact;
    onResult(): void;
}

export const AddContact = observer(({ contact, onResult }: Props): JSX.Element | null => {
    const vm = useViewModel(AddContactViewModel, (model) => {
        model.onResult = onResult
    }, [onResult])
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        mode: 'onSubmit',
        reValidateMode: 'onBlur',
        defaultValues: {
            value: contact?.value ?? '',
            name: '',
        },
    })

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'CONTACT_ADD_NEW_TILE' })}</h2>

                <Form id="add-contact" onSubmit={handleSubmit(vm.submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CONTACT_ADDRESS_PLACEHOLDER' })}
                        invalid={!!formState.errors.value}
                    >
                        <Input
                            autoFocus={!contact}
                            type="text"
                            {...register('value', {
                                required: true,
                                validate: vm.validateAddress,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.value?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.value?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                        </ErrorMessage>
                    </FormControl>

                    <FormControl
                        label={intl.formatMessage({ id: 'CONTACT_NAME_PLACEHOLDER' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus={!!contact}
                            type="text"
                            {...register('name', {
                                required: true,
                                maxLength: 64,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.name?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.name?.type === 'maxLength' && intl.formatMessage({ id: 'ERROR_MAX_LENGTH' })}
                        </ErrorMessage>
                    </FormControl>

                    <ErrorMessage>{vm.error}</ErrorMessage>
                </Form>
            </Content>

            <Footer>
                <Button type="button" form="add-contact" onClick={handleSubmit(vm.submit)}>
                    {intl.formatMessage({ id: 'CONTACT_ADD_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
