import type nt from '@wallet/nekoton-wasm'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Container, Content, CopyText, Header, ParamsPanel, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, convertEvers, formatCurrency, NATIVE_CURRENCY } from '@app/shared'
import type { WithdrawRequest } from '@app/models'

import { WithdrawInfoViewModel } from './WithdrawInfoViewModel'
import './WithdrawInfo.scss'

interface Props {
    selectedAccount: nt.AssetsList;
    withdrawRequest: WithdrawRequest;
    onRemove(request: WithdrawRequest): void;
}

export const WithdrawInfo = observer(({ selectedAccount, withdrawRequest, onRemove }: Props): JSX.Element => {
    const vm = useViewModel(WithdrawInfoViewModel, (model) => {
        model.selectedAccount = selectedAccount
        model.withdrawRequest = withdrawRequest
    })
    const intl = useIntl()

    const handleRemove = () => onRemove(vm.withdrawRequest)

    return (
        <Container className="withdraw-info">
            <Header>
                <h2 className="noselect">
                    {new Date(vm.timestamp).toLocaleString()}
                </h2>
            </Header>

            <Content className="withdraw-info__content">
                <div className="withdraw-info__notification">
                    {intl.formatMessage({ id: 'STAKE_WITHDRAW_NOTIFICATION' })}
                </div>

                <ParamsPanel className="withdraw-info__params" type="transparent">
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_STATUS' })} row>
                        <span className="withdraw-info__param-status">
                            {intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKING_IN_PROGRESS' })}
                        </span>
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })} row>
                        {intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_TYPE_LIQUID_STAKING' })}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKE_AMOUNT' })} row>
                        {`${formatCurrency(convertCurrency(vm.amount, vm.decimals))} ${vm.currencyName}`}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })} row>
                        {vm.exchangeRate && (
                            <span>1 stEVER ≈ {vm.exchangeRate} EVER</span>
                        )}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_RECEIVE' })} row>
                        {vm.receive && (
                            <div className="withdraw-info__param-amount">
                                ~{formatCurrency(convertEvers(vm.receive))} {NATIVE_CURRENCY}
                            </div>
                        )}
                    </ParamsPanel.Param>

                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TO' })}>
                        <CopyText
                            className="withdraw-info__param-copy"
                            id={`copy-${vm.selectedAccount.tonWallet.address}`}
                            text={vm.selectedAccount.tonWallet.address}
                        />
                    </ParamsPanel.Param>
                </ParamsPanel>

                <button type="button" className="withdraw-info__btn" onClick={handleRemove}>
                    {intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_BTN_TEXT' })}
                </button>

                <p className="withdraw-info__btn-hint">
                    {intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_BTN_HINT' })}
                </p>
            </Content>
        </Container>
    )
})
