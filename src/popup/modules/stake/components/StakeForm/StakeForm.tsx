import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Amount, AssetIcon, ErrorMessage, Form, Space, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, convertEvers, formatFiat } from '@app/shared'
import { Data } from '@app/popup/modules/shared/components/Data'

import type { StakeFromData } from '../StakePrepareMessage/StakePrepareMessageViewModel'
import { MessageAmountInput } from '../MessageAmountInput'
import { StakeFormViewModel } from './StakeFormViewModel'

interface Props {
    onSubmit(data: StakeFromData): void;
    onError(error: string): void;
}

export const StakeForm = observer(({ onSubmit, onError }: Props): JSX.Element => {
    const vm = useViewModel(StakeFormViewModel, (model) => {
        model.onSubmit = onSubmit
        model.onError = onError
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
                error={vm.dirty && vm.error && (
                    <ErrorMessage>
                        {vm.error === 'required' && intl.formatMessage({ id: 'ERROR_FIELD_IS_REQUIRED' })}
                        {vm.error === 'invalidAmount' && intl.formatMessage({ id: 'ERROR_INVALID_AMOUNT' })}
                        {vm.error === 'invalidMaxAmount' && intl.formatMessage({ id: 'ERROR_MAX_SENDABLE_AMOUNT' }, { max: convertCurrency(vm.maxAmount, vm.decimals) })}
                        {vm.error === 'insufficientBalance' && intl.formatMessage({ id: 'ERROR_INSUFFICIENT_BALANCE' })}
                        {vm.error === 'pattern' && intl.formatMessage({ id: 'ERROR_INVALID_FORMAT' })}
                    </ErrorMessage>
                )}
                onChange={vm.handleInputChange}
            />

            <Space gap="m" direction="column">
                <Data
                    dir="v"
                    label={intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })}
                    value={vm.exchangeRate && (
                        <div className="stake-form__details-item-value">
                            1 {vm.currencyName} ≈ {vm.exchangeRate} {vm.stakingInfo.symbol}
                        </div>
                    )}
                />

                <hr />
                <Data
                    dir="v"
                    label={intl.formatMessage({ id: 'STAKE_FORM_ATTACHED_AMOUNT' })}
                    value={(
                        <Amount
                            precise
                            icon={<AssetIcon type="ever_wallet" />}
                            value={convertEvers(vm.decimals, vm.depositAttachedFee)}
                            currency={vm.currencyName}
                        />
                    )}
                />

                <hr />
                <Data
                    dir="v"
                    label={intl.formatMessage({ id: 'STAKE_FORM_YOU_RECEIVE' })}
                    value={(
                        <Amount
                            approx
                            icon={<AssetIcon type="token_wallet" address={vm.stEverTokenRoot} />}
                            value={convertCurrency(vm.depositStEverAmount, vm.decimals)}
                            currency={vm.stakingInfo.symbol}
                        />
                    )}
                />

                <hr />
                <Data
                    dir="v"
                    label={intl.formatMessage({ id: 'STAKE_FORM_CURRENT_APY' })}
                    value={`${formatFiat(vm.apy, true)}%`}
                />
            </Space>
        </Form>
    )
})
