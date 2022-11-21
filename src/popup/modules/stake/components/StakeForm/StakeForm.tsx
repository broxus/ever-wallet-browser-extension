import nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { ErrorMessage, useViewModel } from '@app/popup/modules/shared'
import {
    convertCurrency,
    convertEvers,
    formatCurrency, NATIVE_CURRENCY,
    STAKE_APY_PERCENT,
    STAKE_DEPOSIT_ATTACHED_AMOUNT,
} from '@app/shared'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'
import { MessageAmountInput } from '../MessageAmountInput'
import { StakeFormViewModel } from './StakeFormViewModel'
import './StakeForm.scss'

interface Props {
    amount?: string;
    selectedAccount: nt.AssetsList;
    onSubmit(data: StakeFromData): void;
}

export const StakeForm = observer(({ selectedAccount, amount, onSubmit }: Props): JSX.Element => {
    const vm = useViewModel(StakeFormViewModel, (model) => {
        model.selectedAccount = selectedAccount
        model.onSubmit = onSubmit

        if (amount && amount !== '0') {
            model.amount = amount
        }
    })
    const intl = useIntl()

    return (
        <form id="stake" className="stake-form" onSubmit={vm.handleSubmit}>
            <div className="stake-form__field-input">
                <MessageAmountInput
                    value={vm.amount}
                    balance={vm.balance.toFixed()}
                    name={vm.currencyName}
                    decimals={vm.decimals}
                    maxAmount={vm.maxAmount}
                    onChange={vm.handleInputChange}
                />

                {vm.submitted && vm.error && (
                    <ErrorMessage>
                        {vm.error === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                        {vm.error === 'invalidAmount' && intl.formatMessage({ id: 'ERROR_INVALID_AMOUNT' })}
                        {vm.error === 'insufficientBalance' && intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })}
                        {vm.error === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                    </ErrorMessage>
                )}
            </div>

            <div className="stake-form__details">
                <div className="stake-form__details-item">
                    <div className="stake-form__details-item-label">
                        {intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })}
                    </div>
                    {vm.exchangeRate && (
                        <div className="stake-form__details-item-value">
                            1 stEVER ≈ {vm.exchangeRate} EVER
                        </div>
                    )}
                </div>
                <div className="stake-form__details-item">
                    <div className="stake-form__details-item-label">
                        {intl.formatMessage({ id: 'STAKE_FORM_ATTACHED_AMOUNT' })}
                    </div>
                    <div className="stake-form__details-item-value">
                        {convertEvers(STAKE_DEPOSIT_ATTACHED_AMOUNT)}&nbsp;{NATIVE_CURRENCY}
                    </div>
                </div>
                <hr className="stake-form__details-separator" />
                <div className="stake-form__details-item">
                    <div className="stake-form__details-item-label">
                        {intl.formatMessage({ id: 'STAKE_FORM_YOU_RECEIVE' })}
                    </div>
                    <div className="stake-form__details-item-value">
                        <strong>
                            ~{formatCurrency(convertCurrency(vm.depositStEverAmount, 9))} stEVER
                        </strong>
                    </div>
                </div>
                <div className="stake-form__details-item">
                    <div className="stake-form__details-item-label">
                        {intl.formatMessage({ id: 'STAKE_FORM_CURRENT_APY' })}
                    </div>
                    <div className="stake-form__details-item-value">
                        {STAKE_APY_PERCENT}%
                    </div>
                </div>
            </div>
        </form>
    )
})
