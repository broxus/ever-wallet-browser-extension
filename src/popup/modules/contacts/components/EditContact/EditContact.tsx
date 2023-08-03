import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import { Button, Container, Content, ErrorMessage, Footer, Form, FormControl, Input, useViewModel } from '@app/popup/modules/shared'
import { RawContact } from '@app/models'

import { EditContactViewModel, FormValue } from './EditContactViewModel'

interface Props {
    contact: RawContact;
    onResult(): void;
}

export const EditContact = observer(({ contact, onResult }: Props): JSX.Element | null => {
    const vm = useViewModel(EditContactViewModel, (model) => {
        model.raw = contact
        model.onResult = onResult
    }, [contact, onResult])
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        mode: 'onSubmit',
        reValidateMode: 'onBlur',
        defaultValues: {
            name: vm.contact?.name,
        },
    })

    if (!vm.contact) return null

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'CONTACT_EDIT_TILE' })}</h2>

                <Form id="edit-contact" onSubmit={handleSubmit(vm.submit)}>
                    <FormControl
                        label={intl.formatMessage({ id: 'CONTACT_NAME_PLACEHOLDER' })}
                        invalid={!!formState.errors.name}
                    >
                        <Input
                            autoFocus
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
                <Button type="button" form="edit-contact" onClick={handleSubmit(vm.submit)}>
                    {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
