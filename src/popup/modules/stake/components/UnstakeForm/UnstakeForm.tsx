import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Amount, AssetIcon, ErrorMessage, Form, Space, useViewModel } from '@app/popup/modules/shared'
import { convertEvers, STAKE_WITHDRAW_ATTACHED_AMOUNT } from '@app/shared'
import { Data } from '@app/popup/modules/shared/components/Data'

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

            <Space gap="m" direction="column">
                <Data
                    dir="v"
                    label={intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })}
                    value={vm.exchangeRate && (
                        <div className="unstake-form__details-item-value">
                            1 stEVER ≈ {vm.exchangeRate} EVER
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
                            value={convertEvers(vm.decimals, STAKE_WITHDRAW_ATTACHED_AMOUNT)}
                            currency={vm.nativeCurrency}
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
                            icon={<AssetIcon type="ever_wallet" />}
                            value={convertEvers(vm.decimals, vm.withdrawEverAmount)}
                            currency={vm.nativeCurrency}
                        />
                    )}
                />

                <hr />
                <Data
                    dir="v"
                    value={(
                        <div className={styles.info}>
                            {intl.formatMessage(
                                { id: 'STAKE_FORM_UNSTAKE_INFO' },
                                { hours: vm.withdrawTimeHours },
                            )}
                        </div>
                    )}
                />
            </Space>

        </Form>
    )
})
