import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'

import InProgressImg from '@app/popup/assets/img/in-progress.svg'
import AddUserIcon from '@app/popup/assets/icons/add-user.svg'
import { Button, Container, Content, Footer, Input, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, isNativeAddress } from '@app/shared'

import { FormValue, SendResultViewModel } from './SendResultViewModel'

import './SendResult.scss'

interface Props {
    recipient: string;
    onClose: () => void;
}

export const SendResult = observer(({ recipient, onClose }: Props): JSX.Element => {
    const vm = useViewModel(SendResultViewModel)
    const intl = useIntl()
    const { register, handleSubmit, formState } = useForm<FormValue>({
        mode: 'onSubmit',
        reValidateMode: 'onBlur',
        defaultValues: {
            address: recipient,
            name: '',
        },
    })

    return (
        <Container className="send-result">
            <Content className="send-result__content">
                <img src={InProgressImg} alt="" />
                <h1 className="send-result__header">
                    {intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_HEADER' })}
                </h1>

                {(!vm.contacts[recipient] || vm.state !== 'initial') && (
                    <div className="send-result__panel">
                        <div className="send-result__recipient">
                            <div className="send-result__recipient-key">
                                {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}
                            </div>
                            <div className="send-result__recipient-value" title={recipient}>
                                {isNativeAddress(recipient) ? convertAddress(recipient) : recipient}
                            </div>
                        </div>

                        <div className="send-result__text">
                            {intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_TEXT' })}
                        </div>

                        {vm.state === 'initial' && (
                            <Button design="primary-light" onClick={vm.handleAdd}>
                                <AddUserIcon />
                                {intl.formatMessage({ id: 'CONTACT_ADD_TO_CONTACTS' })}
                            </Button>
                        )}

                        {vm.state === 'form' && (
                            <form className="send-result__form" onSubmit={handleSubmit(vm.submit)}>
                                <Input
                                    autoFocus
                                    className="send-result__form-input"
                                    size="s"
                                    type="text"
                                    placeholder={intl.formatMessage({ id: 'CONTACT_NAME_PLACEHOLDER' })}
                                    {...register('name', {
                                        required: true,
                                        maxLength: 64,
                                    })}
                                />
                                <Button
                                    className="send-result__form-btn"
                                    design="primary-light"
                                    type="submit"
                                    disabled={!formState.isValid || vm.loading}
                                >
                                    {intl.formatMessage({ id: 'ADD_BTN_TEXT' })}
                                </Button>
                            </form>
                        )}

                        {vm.state === 'submitted' && (
                            <div className="send-result__submitted">
                                {intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_ADDED' })}
                            </div>
                        )}
                    </div>
                )}
            </Content>

            <Footer>
                <Button onClick={onClose}>
                    {intl.formatMessage({ id: 'CONTINUE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
