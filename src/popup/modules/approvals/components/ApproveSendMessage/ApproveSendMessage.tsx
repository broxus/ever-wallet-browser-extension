import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { LedgerConnector } from '@app/popup/modules/ledger'
import { EnterSendPassword } from '@app/popup/modules/send'
import { Amount, Button, Content, ErrorMessage, Footer, ParamsPanel, Space, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, convertEvers } from '@app/shared'

import { Approval } from '../Approval'
import { ParamsView } from '../ParamsView'
import { ApproveSendMessageViewModel, Step } from './ApproveSendMessageViewModel'

import './ApproveSendMessage.scss'

export const ApproveSendMessage = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveSendMessageViewModel)
    const intl = useIntl()

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account) return null

    if (vm.step.is(Step.LedgerConnect)) {
        return (
            <LedgerConnector
                onNext={vm.step.callback(Step.MessagePreview)}
                onBack={vm.handleLedgerFailed}
            />
        )
    }

    return (
        <Approval
            // title={
            //     vm.step.is(Step.MessagePreview)
            //         ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_PREVIEW_TITLE' })
            //         : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_TITLE' })
            // }
            account={vm.account}
            origin={vm.approval.origin}
            loading={!vm.contractState || vm.ledger.loading}
        >
            {vm.step.is(Step.MessagePreview) && vm.contractState && (
                <>
                    <Content>
                        <Space direction="column" gap="l">
                            <ParamsPanel title={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_PREVIEW_TITLE' })}>
                                <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}>
                                    {vm.approval.requestData.recipient}
                                </ParamsPanel.Param>

                                {vm.tokenTransaction != null && (
                                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}>
                                        <Amount
                                            value={convertCurrency(
                                                vm.tokenTransaction.amount,
                                                vm.tokenTransaction.decimals,
                                            )}
                                            currency={vm.tokenTransaction.symbol}
                                        />
                                    </ParamsPanel.Param>
                                )}

                                <ParamsPanel.Param
                                    label={!vm.tokenTransaction
                                        ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })
                                        : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                                >
                                    <Amount
                                        value={convertEvers(vm.approval.requestData.amount)}
                                        currency={vm.nativeCurrency}
                                    />
                                    {vm.isInsufficientBalance && (
                                        <ErrorMessage>
                                            {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_INSUFFICIENT_FUNDS' })}
                                        </ErrorMessage>
                                    )}
                                </ParamsPanel.Param>

                                <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_BLOCKCHAIN_FEE' })}>
                                    {vm.isDeployed && (
                                        vm.fees
                                            ? (
                                                <Amount
                                                    value={convertEvers(vm.fees)}
                                                    currency={vm.nativeCurrency}
                                                    approx
                                                />
                                            )
                                            : intl.formatMessage({ id: 'CALCULATING_HINT' })
                                    )}

                                    {!vm.isDeployed && (
                                        <ErrorMessage>
                                            {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_OPERATION_NOT_POSSIBLE' })}
                                        </ErrorMessage>
                                    )}
                                </ParamsPanel.Param>
                            </ParamsPanel>

                            {vm.approval.requestData.payload && (
                                <ParamsPanel title={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_DATA' })}>
                                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_DATA_METHOD' })}>
                                        {vm.approval.requestData.payload.method}
                                    </ParamsPanel.Param>
                                    <ParamsPanel.Param>
                                        <ParamsView params={vm.approval.requestData.payload.params} />
                                    </ParamsPanel.Param>
                                </ParamsPanel>
                            )}
                        </Space>
                    </Content>

                    <Footer>
                        {!vm.selectedKey && (
                            <ErrorMessage>
                                {intl.formatMessage({ id: 'ERROR_CUSTODIAN_KEY_NOT_FOUND' })}
                            </ErrorMessage>
                        )}
                        <Space direction="row" gap="s">
                            <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                                {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                            </Button>
                            <Button
                                disabled={vm.isInsufficientBalance || !vm.selectedKey || !vm.fees}
                                onClick={vm.step.callback(Step.EnterPassword)}
                            >
                                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                            </Button>
                        </Space>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.EnterPassword) && vm.selectedKey && (
                <EnterSendPassword
                    contractType={vm.account.tonWallet.contractType}
                    keyEntries={vm.selectableKeys!.keys}
                    keyEntry={vm.selectedKey}
                    amount={vm.messageAmount}
                    recipient={vm.approval.requestData.recipient}
                    fees={vm.fees}
                    error={vm.error}
                    loading={vm.loading}
                    context={vm.context}
                    onSubmit={vm.onSubmit}
                    onBack={vm.step.callback(Step.MessagePreview)}
                    onChangeKeyEntry={vm.setKey}
                />
            )}
        </Approval>
    )
})
