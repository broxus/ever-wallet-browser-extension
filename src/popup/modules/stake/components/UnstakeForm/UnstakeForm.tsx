import nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useEffect } from 'react'

import { ErrorMessage, useViewModel } from '@app/popup/modules/shared'
import {
    convertEvers,
    formatCurrency,
    NATIVE_CURRENCY,
    STAKE_WITHDRAW_ATTACHED_AMOUNT,
} from '@app/shared'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'
import { MessageAmountInput } from '../MessageAmountInput'
import { UnstakeFormViewModel } from './UnstakeFormViewModel'
import './UnstakeForm.scss'

interface Props {
    amount?: string;
    balance: string;
    selectedAccount: nt.AssetsList;
    onSubmit(data: StakeFromData): void;
}

export const UnstakeForm = observer(({ selectedAccount, amount, balance, onSubmit }: Props): JSX.Element => {
    const vm = useViewModel(UnstakeFormViewModel, (model) => {
        model.selectedAccount = selectedAccount
        model.onSubmit = onSubmit

        if (amount && amount !== '0') {
            model.amount = amount
        }
    })
    const intl = useIntl()

    useEffect(() => vm.setBalance(balance), [balance])

    return (
        <form id="stake" className="unstake-form" onSubmit={vm.handleSubmit}>
            <div className="unstake-form__field-input">
                <MessageAmountInput
                    value={vm.amount}
                    balance={vm.balance}
                    name={vm.currencyName}
                    decimals={vm.decimals}
                    maxAmount={vm.maxAmount}
                    rootTokenContract={vm.rootTokenContract}
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

            <div className="unstake-form__details">
                <div className="unstake-form__details-item">
                    <div className="unstake-form__details-item-label">
                        {intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })}
                    </div>
                    {vm.exchangeRate && (
                        <div className="unstake-form__details-item-value">
                            1 stEVER ≈ {vm.exchangeRate} EVER
                        </div>
                    )}
                </div>
                <div className="unstake-form__details-item">
                    <div className="unstake-form__details-item-label">
                        {intl.formatMessage({ id: 'STAKE_FORM_ATTACHED_AMOUNT' })}
                    </div>
                    <div className="unstake-form__details-item-value">
                        {convertEvers(STAKE_WITHDRAW_ATTACHED_AMOUNT)}&nbsp;{NATIVE_CURRENCY}
                    </div>
                </div>
                <hr className="unstake-form__details-separator" />
                <div className="unstake-form__details-item">
                    <div className="unstake-form__details-item-label">
                        {intl.formatMessage({ id: 'STAKE_FORM_YOU_RECEIVE' })}
                    </div>
                    <div className="unstake-form__details-item-value">
                        <strong>
                            ~{formatCurrency(convertEvers(vm.withdrawEverAmount))}
                            &nbsp;
                            {NATIVE_CURRENCY}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="unstake-form__details-info">
                {intl.formatMessage({ id: 'STAKE_FORM_UNSTAKE_INFO' })}
            </div>
        </form>
    )
})
