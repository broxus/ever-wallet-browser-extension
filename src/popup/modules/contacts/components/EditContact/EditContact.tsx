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

import { EditContactViewModel, FormValue } from './EditContactViewModel'
import './EditContact.scss'

interface Props {
    contact: RawContact;
    onResult(): void;
    onBack(): void;
}

export const EditContact = observer(({ contact, onResult, onBack }: Props): JSX.Element | null => {
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
        <Container className="edit-contact">
            <Header>
                <h2>{intl.formatMessage({ id: 'CONTACT_EDIT_TILE' })}</h2>
            </Header>

            <Content className="edit-contact__content">
                <form id="edit-contact" className="edit-contact__form" onSubmit={handleSubmit(vm.submit)}>
                    <div className="edit-contact__address">
                        {vm.contact.type === 'address' && (
                            <UserAvatar className="edit-contact__address-avatar" address={vm.contact.value} small />
                        )}
                        {vm.contact.type === 'public_key' && (
                            <KeyIcon className="edit-contact__address-avatar" />
                        )}
                        <div className="edit-contact__address-text">{vm.contact.value}</div>
                    </div>

                    <div>
                        <Input
                            autoFocus
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
                    <Button type="button" form="edit-contact" onClick={handleSubmit(vm.submit)}>
                        {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
