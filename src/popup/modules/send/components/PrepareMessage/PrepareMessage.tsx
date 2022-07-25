import { observer } from 'mobx-react-lite'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { amountPattern, convertCurrency, SelectedAsset } from '@app/shared'
import {
    Button,
    ButtonGroup,
    Checkbox,
    Container,
    Content,
    Footer,
    Header,
    Input,
    Select,
    UserAvatar,
    useViewModel,
} from '@app/popup/modules/shared'

import { EnterSendPassword } from '../EnterSendPassword'
import { MessageFromData, PrepareMessageViewModel, Step } from './PrepareMessageViewModel'

import './PrepareMessage.scss'

interface Props {
    defaultAsset: SelectedAsset
    onBack: () => void
}

export const PrepareMessage = observer(({ defaultAsset, onBack }: Props): JSX.Element => {
    const vm = useViewModel(PrepareMessageViewModel, model => {
        model.defaultAsset = defaultAsset
    })
    const intl = useIntl()
    const { register, setValue, handleSubmit, formState } = useForm<MessageFromData>()

    React.useEffect(() => {
        if (vm.messageParams && vm.step.value === Step.EnterAddress) {
            setValue('amount', vm.messageParams.originalAmount)
            setValue('recipient', vm.messageParams.recipient)
            setValue('comment', vm.messageParams.comment)
        }
    }, [vm.step.value])

    return (
        <Container className="prepare-message">
            <Header>
                <div className="prepare-message__account-details">
                    <UserAvatar address={vm.everWalletAsset.address} small />
                    {' '}
                    <span className="prepare-message__account-details-title">{vm.selectedAccount.name}</span>
                </div>
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
                        <form id="send" onSubmit={handleSubmit(vm.submitMessageParams)}>
                            <Select
                                options={vm.options}
                                placeholder={intl.formatMessage({ id: 'SELECT_CURRENCY_SELECT_PLACEHOLDER' })}
                                defaultValue={vm.defaultOption.value}
                                value={vm.selectedAsset}
                                onChange={vm.onChangeAsset}
                            />
                            {vm.decimals != null && (
                                <div
                                    className="prepare-message__balance"
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage(
                                            { id: 'SEND_MESSAGE_CURRENCY_SELECT_HINT' },
                                            {
                                                value: convertCurrency(vm.balance.toString(), vm.decimals),
                                                symbol: vm.currencyName,
                                            },
                                            { ignoreTag: true },
                                        ),
                                    }}
                                />
                            )}
                            <Input
                                autoFocus
                                type="text"
                                className="prepare-message__field-input"
                                placeholder={intl.formatMessage({
                                    id: 'SEND_MESSAGE_AMOUNT_FIELD_PLACEHOLDER',
                                })}
                                {...register('amount', {
                                    required: true,
                                    pattern: vm.decimals != null ? amountPattern(vm.decimals) : /^\d$/,
                                    validate: {
                                        invalidAmount: vm.validateAmount,
                                        insufficientBalance: vm.validateBalance,
                                    },
                                })}
                            />

                            {formState.errors.amount && (
                                <div className="prepare-message__error-message">
                                    {formState.errors.amount.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                    {formState.errors.amount.type === 'invalidAmount' && intl.formatMessage({ id: 'ERROR_INVALID_AMOUNT' })}
                                    {formState.errors.amount.type === 'insufficientBalance' && intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })}
                                    {formState.errors.amount.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                                </div>
                            )}

                            <Input
                                type="text"
                                placeholder={intl.formatMessage({
                                    id: 'SEND_MESSAGE_RECIPIENT_FIELD_PLACEHOLDER',
                                })}
                                className="prepare-message__field-input"
                                {...register('recipient', {
                                    required: true,
                                    validate: vm.validateAddress,
                                })}
                            />

                            {formState.errors.recipient && (
                                <div className="prepare-message__error-message">
                                    {formState.errors.recipient.type === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                                    {formState.errors.recipient.type === 'validate' && intl.formatMessage({ id: 'ERROR_INVALID_RECIPIENT' })}
                                    {formState.errors.recipient.type === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                                </div>
                            )}

                            <Input
                                type="text"
                                className="prepare-message__field-input"
                                placeholder={intl.formatMessage({ id: 'SEND_MESSAGE_COMMENT_FIELD_PLACEHOLDER' })}
                                {...register('comment')}
                            />

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

                    <Footer>
                        <ButtonGroup>
                            <Button group="small" design="secondary" onClick={onBack}>
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>
                            <Button form="send" type="submit" disabled={!vm.selectedKey}>
                                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                            </Button>
                        </ButtonGroup>
                    </Footer>
                </>
            )}

            {vm.step.value === Step.EnterPassword && vm.selectedKey && (
                <EnterSendPassword
                    keyEntries={vm.selectableKeys.keys}
                    keyEntry={vm.selectedKey}
                    amount={vm.messageParams?.amount}
                    recipient={vm.messageParams?.recipient}
                    masterKeysNames={vm.masterKeysNames}
                    fees={vm.fees}
                    error={vm.error}
                    disabled={vm.loading}
                    onSubmit={vm.submitPassword}
                    onBack={vm.step.setEnterAddress}
                    onChangeKeyEntry={vm.onChangeKeyEntry}
                />
            )}
        </Container>
    )
})
