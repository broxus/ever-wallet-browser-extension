import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { amountPattern, isNativeAddress, MULTISIG_UNCONFIRMED_LIMIT, SelectedAsset } from '@app/shared'
import {
    AmountInput,
    Button,
    ButtonGroup,
    Checkbox,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Input,
    Loader,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'
import { ContactInput } from '@app/popup/modules/contacts'
import PlusIcon from '@app/popup/assets/icons/plus.svg'

import { EnterSendPassword } from '../EnterSendPassword'
import { MessageFormData, MessageParams, PrepareMessageViewModel, Step } from './PrepareMessageViewModel'

import './PrepareMessage.scss'

interface Props {
    defaultAsset: SelectedAsset;
    defaultAddress: string | undefined;
    onBack(): void;
    onSend(params: MessageParams): void;
}

export const PrepareMessage = observer(({ defaultAsset, defaultAddress, onBack, onSend }: Props): JSX.Element => {
    const form = useForm<MessageFormData>({
        defaultValues: {
            recipient: defaultAddress,
        },
    })
    const vm = useViewModel(PrepareMessageViewModel, model => {
        model.defaultAsset = defaultAsset
        model.form = form
        model.onSend = onSend
    })
    const [isDens, setIsDens] = useState(() => defaultAddress && !isNativeAddress(defaultAddress))
    const intl = useIntl()
    const { register, handleSubmit, formState, control, watch } = form

    useEffect(() => {
        const { unsubscribe } = watch(({ recipient }, { name }) => {
            if (name !== 'recipient') return

            setIsDens(recipient && vm.validateAddress(recipient) && !isNativeAddress(recipient))
        })

        return unsubscribe
    }, [watch])

    if (vm.step.is(Step.LedgerConnect)) {
        return (
            <LedgerConnector
                onNext={vm.openEnterAddress}
                onBack={vm.openEnterAddress}
            />
        )
    }

    return (
        <Container className="prepare-message">
            {vm.ledgerLoading && (
                <div className="prepare-message__loader">
                    <Loader />
                </div>
            )}

            <Header>
                <UserInfo className="prepare-message__user-info" account={vm.selectedAccount} />

                {vm.step.value === Step.EnterAddress && (
                    <h2 className="prepare-message__header-title">
                        {intl.formatMessage({ id: 'SEND_MESSAGE_PANEL_ENTER_ADDRESS_HEADER' })}
                    </h2>
                )}
                {vm.step.value === Step.EnterPassword && (
                    <h2 className="prepare-message__header-title">
                        {intl.formatMessage({ id: 'SEND_MESSAGE_PANEL_ENTER_PASSWORD_HEADER' })}
                    </h2>
                )}
            </Header>

            {vm.step.value === Step.EnterAddress && (
                <>
                    <Content>
                        <form id="send" className="prepare-message__form" onSubmit={handleSubmit(vm.submitMessageParams)}>
                            <div className="prepare-message__field">
                                <Controller
                                    name="amount"
                                    defaultValue=""
                                    control={control}
                                    rules={{
                                        required: true,
                                        pattern: vm.decimals != null ? amountPattern(vm.decimals) : /^\d$/,
                                        validate: {
                                            invalidAmount: vm.validateAmount,
                                            insufficientBalance: vm.validateBalance,
                                        },
                                    }}
                                    render={({ field }) => (
                                        <AmountInput
                                            {...field}
                                            account={vm.selectedAccount}
                                            asset={vm.selectedAsset}
                                            onChangeAsset={vm.onChangeAsset}
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
                                <Controller
                                    name="recipient"
                                    defaultValue=""
                                    control={control}
                                    rules={{
                                        required: true,
                                        validate: vm.validateAddress,
                                    }}
                                    render={({ field }) => (
                                        <ContactInput {...field} size="s" />
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
                                        size="s"
                                        placeholder={intl.formatMessage({ id: 'SEND_MESSAGE_COMMENT_FIELD_PLACEHOLDER' })}
                                        {...register('comment')}
                                    />
                                )}
                            </div>

                            {vm.selectedAsset && (
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
                        </form>
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
                        <ButtonGroup>
                            <Button group="small" design="secondary" onClick={onBack}>
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>
                            <Button form="send" type="submit" disabled={!vm.selectedKey || vm.isMultisigLimit}>
                                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                            </Button>
                        </ButtonGroup>
                    </Footer>
                </>
            )}

            {vm.step.value === Step.EnterPassword && vm.selectedKey && (
                <EnterSendPassword
                    contractType={vm.selectedAccount.tonWallet.contractType}
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
            )}
        </Container>
    )
})
