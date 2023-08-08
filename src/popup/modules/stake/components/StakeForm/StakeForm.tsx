import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Amount, ErrorMessage, Form, ParamsPanel, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, convertEvers, formatCurrency, NATIVE_CURRENCY, STAKE_APY_PERCENT, STAKE_DEPOSIT_ATTACHED_AMOUNT } from '@app/shared'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'
import { MessageAmountInput } from '../MessageAmountInput'
import { StakeFormViewModel } from './StakeFormViewModel'

interface Props {
    onSubmit(data: StakeFromData): void;
}

export const StakeForm = observer(({ onSubmit }: Props): JSX.Element => {
    const vm = useViewModel(StakeFormViewModel, (model) => {
        model.onSubmit = onSubmit
    })
    const intl = useIntl()

    return (
        <Form id="stake" onSubmit={vm.handleSubmit}>
            <MessageAmountInput
                value={vm.amount}
                balance={vm.balance.toFixed()}
                name={vm.currencyName}
                decimals={vm.decimals}
                maxAmount={vm.maxAmount}
                error={vm.submitted && vm.error && (
                    <ErrorMessage>
                        {vm.error === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                        {vm.error === 'invalidAmount' && intl.formatMessage({ id: 'ERROR_INVALID_AMOUNT' })}
                        {vm.error === 'insufficientBalance' && intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })}
                        {vm.error === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                    </ErrorMessage>
                )}
                onChange={vm.handleInputChange}
            />

            <ParamsPanel>
                <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })}>
                    {vm.exchangeRate && (
                        <div className="stake-form__details-item-value">
                            1 stEVER ≈ {vm.exchangeRate} EVER
                        </div>
                    )}
                </ParamsPanel.Param>
                <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_FORM_ATTACHED_AMOUNT' })}>
                    {convertEvers(STAKE_DEPOSIT_ATTACHED_AMOUNT)}&nbsp;{NATIVE_CURRENCY}
                </ParamsPanel.Param>
                <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_FORM_YOU_RECEIVE' })}>
                    <Amount
                        approx
                        value={formatCurrency(convertCurrency(vm.depositStEverAmount, 9))}
                        currency="stEVER"
                    />
                </ParamsPanel.Param>
                <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_FORM_CURRENT_APY' })}>
                    {STAKE_APY_PERCENT}%
                </ParamsPanel.Param>
            </ParamsPanel>
        </Form>
    )
})
