import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { LedgerConnector } from '@app/popup/modules/ledger'
import { EnterSendPassword } from '@app/popup/modules/send'
import { Amount, Button, Container, Content, ErrorMessage, Footer, PageLoader, ParamsPanel, Space, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, convertEvers } from '@app/shared'

import { ParamsView } from '../ParamsView'
import { ApproveSendMessageViewModel, Step } from './ApproveSendMessageViewModel'
import { ApprovalNetwork } from '../ApprovalNetwork'

export const ApproveSendMessage = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveSendMessageViewModel)
    const intl = useIntl()

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account || !vm.contractState) {
        return <PageLoader />
    }

    if (vm.step.is(Step.LedgerConnect)) {
        return (
            <LedgerConnector
                onNext={vm.step.callback(Step.MessagePreview)}
                onBack={vm.handleLedgerFailed}
            />
        )
    }

    if (vm.step.is(Step.EnterPassword)) {
        return (
            <EnterSendPassword
                contractType={vm.account.tonWallet.contractType}
                keyEntries={vm.selectableKeys!.keys}
                keyEntry={vm.selectedKey!}
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
        )
    }

    return (
        <Container>
            {vm.ledger.loading && <PageLoader />}

            <Content>
                <ApprovalNetwork />

                <Space direction="column" gap="l">
                    <h2>{intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_PREVIEW_TITLE' })}</h2>

                    <ParamsPanel>
                        <ParamsPanel.Param>
                            <UserInfo account={vm.account} />
                        </ParamsPanel.Param>
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                            {vm.approval.origin}
                        </ParamsPanel.Param>

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
                        <ParamsPanel
                            title={intl.formatMessage(
                                { id: 'APPROVE_SEND_MESSAGE_TERM_DATA_METHOD' },
                                { method: vm.approval.requestData.payload.method },
                            )}
                        >
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
        </Container>
    )
})
