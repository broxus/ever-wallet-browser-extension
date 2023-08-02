import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { amountPattern, MULTISIG_UNCONFIRMED_LIMIT } from '@app/shared'
import {
    AmountInput,
    Button,
    Checkbox,
    Container,
    Content,
    ErrorMessage,
    Footer, Form, FormControl,
    Header,
    Input,
    Navbar,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { ContactInput } from '@app/popup/modules/contacts'
import PlusIcon from '@app/popup/assets/icons/plus.svg'

import { MessageFormData, PrepareMessageViewModel } from './PrepareMessageViewModel'
import './PrepareMessage.scss'

export const PrepareMessage = observer((): JSX.Element => {
    const vm = useViewModel(PrepareMessageViewModel, (model) => {
        model.setFormError = (...args) => setError(...args)
    })
    const form = useForm<MessageFormData>({
        defaultValues: {
            recipient: vm.pageStore.messageParams?.recipient ?? vm.pageStore.initialAddress,
            amount: vm.pageStore.messageParams?.originalAmount,
            comment: vm.pageStore.messageParams?.comment,
        },
    })

    const [isDens, setIsDens] = useState(() => vm.isDens(form.getValues().recipient))
    const intl = useIntl()
    const { register, handleSubmit, formState, control, watch, setError } = form

    useEffect(() => {
        const { unsubscribe } = watch(({ recipient }, { name }) => {
            if (name !== 'recipient') return
            setIsDens(vm.isDens(recipient))
        })

        return unsubscribe
    }, [watch])

    return (
        <Container className="prepare-message">
            <Header>
                <Navbar close="window">
                    <UserInfo account={vm.account} compact />
                </Navbar>

                {/*{vm.step.value === Step.EnterAddress && (
                    <h2 className="prepare-message__header-title">
                        {intl.formatMessage({ id: 'SEND_MESSAGE_PANEL_ENTER_ADDRESS_HEADER' })}
                    </h2>
                )}
                {vm.step.value === Step.EnterPassword && (
                    <h2 className="prepare-message__header-title">
                        {intl.formatMessage({ id: 'SEND_MESSAGE_PANEL_ENTER_PASSWORD_HEADER' })}
                    </h2>
                )}*/}
            </Header>

            <Content>
                <Form id="send" onSubmit={handleSubmit(vm.submit)}>
                    <FormControl label={intl.formatMessage({ id: 'FORM_RECEIVER_ADDRESS_LABEL' })}>
                        <Controller
                            name="recipient"
                            control={control}
                            rules={{
                                required: true,
                                validate: vm.validateAddress,
                            }}
                            render={({ field }) => (
                                <ContactInput
                                    {...field}
                                    autoFocus
                                    type="address"
                                />
                            )}
                        />

                        {formState.errors.recipient && (
                            <ErrorMessage>
                                {formState.errors.recipient.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                {formState.errors.recipient.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_RECIPIENT' })}
                                {formState.errors.recipient.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                                {formState.errors.recipient.type === 'invalid' && intl.formatMessage({ id: 'ERROR_INVALID_ADDRESS' })}
                            </ErrorMessage>
                        )}
                    </FormControl>

                    <div className="prepare-message__field">
                        <Controller
                            name="amount"
                            defaultValue=""
                            control={control}
                            rules={{
                                required: true,
                                pattern: vm.decimals != null ? amountPattern(vm.decimals) : /^\d+$/,
                                validate: {
                                    invalidAmount: vm.validateAmount,
                                    insufficientBalance: vm.validateBalance,
                                },
                            }}
                            render={({ field }) => (
                                <AmountInput
                                    {...field}
                                    account={vm.account}
                                    asset={vm.asset}
                                />
                            )}
                        />

                        {formState.errors.amount && (
                            <ErrorMessage>
                                {formState.errors.amount.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                {formState.errors.amount.type === 'invalidAmount' && intl.formatMessage({ id: 'ERROR_INVALID_AMOUNT' })}
                                {formState.errors.amount.type === 'insufficientBalance' && intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })}
                                {formState.errors.amount.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                            </ErrorMessage>
                        )}
                    </div>

                    <div className="prepare-message__field">
                        {!vm.commentVisible && (
                            <button type="button" className="prepare-message__add-btn" onClick={vm.showComment}>
                                <PlusIcon />
                                {intl.formatMessage({ id: 'ADD_COMMENT' })}
                            </button>
                        )}
                        {vm.commentVisible && (
                            <Input
                                type="text"
                                placeholder={intl.formatMessage({ id: 'SEND_MESSAGE_COMMENT_FIELD_PLACEHOLDER' })}
                                {...register('comment')}
                            />
                        )}
                    </div>

                    {vm.asset.type === 'token_wallet' && (
                        <div className="prepare-message__field-checkbox">
                            <Checkbox
                                id="notify"
                                checked={vm.notifyReceiver}
                                onChange={vm.setNotifyReceiver}
                            />
                            <label htmlFor="notify" className="prepare-message__field-checkbox-label">
                                {intl.formatMessage({ id: 'SEND_MESSAGE_NOTIFY_CHECKBOX_LABEL' })}
                            </label>
                        </div>
                    )}
                </Form>
            </Content>

            <Footer className="prepare-message__footer">
                <div className="prepare-message__footer-info">
                    {formState.touchedFields.recipient && isDens && (
                        <div className="prepare-message__footer-hint">
                            {intl.formatMessage({ id: 'SEND_MESSAGE_DENS_RECIPIENT_HINT' })}
                        </div>
                    )}
                    {vm.isMultisigLimit && (
                        <ErrorMessage>
                            {intl.formatMessage(
                                { id: 'ERROR_MULTISIG_LIMIT' },
                                { count: MULTISIG_UNCONFIRMED_LIMIT },
                            )}
                        </ErrorMessage>
                    )}
                </div>
                <Button form="send" type="submit" disabled={!vm.key || vm.isMultisigLimit}>
                    {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                </Button>
            </Footer>

            {/*{vm.step.value === Step.EnterPassword && vm.selectedKey && (
                <EnterSendPassword
                    contractType={vm.everWalletAsset.contractType}
                    keyEntries={vm.selectableKeys.keys}
                    keyEntry={vm.selectedKey}
                    amount={vm.messageParams?.amount}
                    recipient={vm.messageParams?.recipient}
                    fees={vm.fees}
                    error={vm.error}
                    balanceError={vm.balanceError}
                    disabled={vm.loading}
                    context={vm.context}
                    onSubmit={vm.submitPassword}
                    onBack={vm.openEnterAddress}
                    onChangeKeyEntry={vm.onChangeKeyEntry}
                />
            )}*/}
        </Container>
    )
})
