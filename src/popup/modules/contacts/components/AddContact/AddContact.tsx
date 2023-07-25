import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Input,
    UserAvatar,
    useViewModel,
} from '@app/popup/modules/shared'
import { RawContact } from '@app/models'
import KeyIcon from '@app/popup/assets/icons/key.svg'

import { AddContactViewModel, FormValue } from './AddContactViewModel'
import './AddContact.scss'

interface Props {
    contact?: RawContact;
    onResult(): void;
    onBack(): void;
}

export const AddContact = observer(({ contact, onResult, onBack }: Props): JSX.Element | null => {
    const vm = useViewModel(AddContactViewModel, (model) => {
        model.onResult = onResult
    }, [onResult])
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        mode: 'onSubmit',
        reValidateMode: 'onBlur',
        defaultValues: {
            value: contact?.value,
            name: '',
        },
    })

    return (
        <Container className="add-contact">
            <Header>
                <h2>{intl.formatMessage({ id: 'CONTACT_ADD_NEW_TILE' })}</h2>
            </Header>

            <Content className="add-contact__content">
                <form className="add-contact__form" id="add-contact" onSubmit={handleSubmit(vm.submit)}>
                    {contact && (
                        <>
                            <p className="add-contact__hint">
                                {intl.formatMessage({ id: 'CONTACT_ADD_NEW_HINT' })}
                            </p>
                            <div className="add-contact__address">
                                {contact.type === 'address' && (
                                    <UserAvatar className="add-contact__address-avatar" address={contact.value} small />
                                )}
                                {contact.type === 'public_key' && (
                                    <KeyIcon className="add-contact__address-avatar" />
                                )}
                                <div className="add-contact__address-text">{contact.value}</div>
                            </div>
                        </>
                    )}

                    {!contact && (
                        <div>
                            <Input
                                autoFocus
                                type="text"
                                placeholder={intl.formatMessage({ id: 'CONTACT_ADDRESS_PLACEHOLDER' })}
                                {...register('value', {
                                    required: true,
                                    validate: vm.validateAddress,
                                })}
                            />
                            <ErrorMessage>
                                {formState.errors.value?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                {formState.errors.value?.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                            </ErrorMessage>
                        </div>
                    )}

                    <div>
                        <Input
                            autoFocus={!!contact}
                            type="text"
                            placeholder={intl.formatMessage({ id: 'CONTACT_NAME_PLACEHOLDER' })}
                            {...register('name', {
                                required: true,
                                maxLength: 64,
                            })}
                        />
                        <ErrorMessage>
                            {formState.errors.name?.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                            {formState.errors.name?.type === 'maxLength' && intl.formatMessage({ id: 'ERROR_MAX_LENGTH' })}
                        </ErrorMessage>
                    </div>

                    <ErrorMessage>{vm.error}</ErrorMessage>
                </form>
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button type="button" form="add-contact" onClick={handleSubmit(vm.submit)}>
                        {intl.formatMessage({ id: 'CONTACT_ADD_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
