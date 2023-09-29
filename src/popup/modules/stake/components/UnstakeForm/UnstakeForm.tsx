import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Amount, AssetIcon, ErrorMessage, Form, ParamsPanel, useViewModel } from '@app/popup/modules/shared'
import { convertEvers, formatCurrency, NATIVE_CURRENCY, STAKE_WITHDRAW_ATTACHED_AMOUNT } from '@app/shared'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'
import { MessageAmountInput } from '../MessageAmountInput'
import { UnstakeFormViewModel } from './UnstakeFormViewModel'
import styles from './UnstakeForm.module.scss'

interface Props {
    onSubmit(data: StakeFromData): void;
}

export const UnstakeForm = observer(({ onSubmit }: Props): JSX.Element => {
    const vm = useViewModel(UnstakeFormViewModel, (model) => {
        model.onSubmit = onSubmit
    })
    const intl = useIntl()

    return (
        <Form id="stake" onSubmit={vm.handleSubmit}>
            <MessageAmountInput
                value={vm.amount}
                balance={vm.balance}
                name={vm.currencyName}
                decimals={vm.decimals}
                maxAmount={vm.maxAmount}
                rootTokenContract={vm.rootTokenContract}
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
                        <div className="unstake-form__details-item-value">
                            1 stEVER ≈ {vm.exchangeRate} EVER
                        </div>
                    )}
                </ParamsPanel.Param>
                <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_FORM_ATTACHED_AMOUNT' })}>
                    <Amount
                        icon={<AssetIcon type="ever_wallet" />}
                        value={convertEvers(STAKE_WITHDRAW_ATTACHED_AMOUNT)}
                        currency={NATIVE_CURRENCY}
                    />
                </ParamsPanel.Param>
                <ParamsPanel.Param bold label={intl.formatMessage({ id: 'STAKE_FORM_YOU_RECEIVE' })}>
                    <Amount
                        approx
                        icon={<AssetIcon type="ever_wallet" />}
                        value={formatCurrency(convertEvers(vm.withdrawEverAmount))}
                        currency={NATIVE_CURRENCY}
                    />
                </ParamsPanel.Param>
                <ParamsPanel.Param>
                    <div className={styles.info}>
                        {intl.formatMessage(
                            { id: 'STAKE_FORM_UNSTAKE_INFO' },
                            { hours: vm.withdrawTimeHours },
                        )}
                    </div>
                </ParamsPanel.Param>
            </ParamsPanel>
        </Form>
    )
})
