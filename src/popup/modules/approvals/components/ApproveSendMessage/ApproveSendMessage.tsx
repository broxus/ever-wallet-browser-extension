import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'

import { LedgerConnector } from '@app/popup/modules/ledger'
import { Amount, AmountWithFees, AssetIcon, Button, Container, Content, ErrorMessage, Footer, PageLoader, ParamsPanel, Space, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, convertEvers } from '@app/shared'

import { ParamsView } from '../ParamsView'
import { ApprovalNetwork } from '../ApprovalNetwork'
import { PasswordForm, PasswordFormRef } from '../PasswordForm'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveSendMessageViewModel } from './ApproveSendMessageViewModel'
import styles from './ApproveSendMessage.module.scss'

export const ApproveSendMessage = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveSendMessageViewModel)
    const intl = useIntl()
    const ref = useRef<PasswordFormRef>(null)

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account || !vm.contractState) {
        return <PageLoader />
    }

    if (vm.ledgerConnect) {
        return (
            <LedgerConnector
                onNext={vm.handleLedgerConnected}
                onBack={vm.handleLedgerFailed}
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

                    {vm.keyEntry && vm.selectableKeys && (
                        <PasswordForm
                            ref={ref}
                            error={vm.error}
                            keyEntry={vm.keyEntry}
                            keyEntries={vm.selectableKeys.keys}
                            onSubmit={vm.onSubmit}
                            onChangeKeyEntry={vm.setKey}
                        />
                    )}

                    <ParamsPanel>
                        <ParamsPanel.Param>
                            <UserInfo account={vm.account} />
                        </ParamsPanel.Param>
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                            <WebsiteIcon origin={vm.approval.origin} />
                        </ParamsPanel.Param>

                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}>
                            {vm.approval.requestData.recipient}
                        </ParamsPanel.Param>

                        {vm.tokenTransaction && (
                            <ParamsPanel.Param bold label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}>
                                <AmountWithFees
                                    icon={<AssetIcon type="token_wallet" address={vm.tokenTransaction.rootTokenContract} />}
                                    value={convertCurrency(vm.tokenTransaction.amount, vm.tokenTransaction.decimals)}
                                    currency={vm.tokenTransaction.symbol}
                                    fees={vm.fees}
                                    error={!vm.isDeployed && (
                                        <ErrorMessage>
                                            {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_OPERATION_NOT_POSSIBLE' })}
                                        </ErrorMessage>
                                    )}
                                />
                            </ParamsPanel.Param>
                        )}

                        <ParamsPanel.Param
                            bold
                            label={!vm.tokenTransaction
                                ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })
                                : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                        >
                            {!vm.tokenTransaction && (
                                <AmountWithFees
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(vm.approval.requestData.amount)}
                                    currency={vm.nativeCurrency}
                                    fees={vm.fees}
                                    error={!vm.isDeployed && (
                                        <ErrorMessage>
                                            {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_OPERATION_NOT_POSSIBLE' })}
                                        </ErrorMessage>
                                    )}
                                />
                            )}
                            {vm.tokenTransaction && (
                                <Amount
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(vm.approval.requestData.amount)}
                                    currency={vm.nativeCurrency}
                                />
                            )}
                            {vm.isInsufficientBalance && (
                                <ErrorMessage>
                                    {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_INSUFFICIENT_FUNDS' })}
                                </ErrorMessage>
                            )}
                        </ParamsPanel.Param>
                    </ParamsPanel>

                    {vm.approval.requestData.payload && (
                        <ParamsPanel
                            collapsible
                            title={(
                                <div className={styles.data}>
                                    <div className={styles.label}>
                                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_DATA' })}
                                    </div>
                                    <div className={styles.method}>
                                        {intl.formatMessage(
                                            { id: 'APPROVE_SEND_MESSAGE_TERM_DATA_METHOD' },
                                            { method: vm.approval.requestData.payload.method },
                                        )}
                                    </div>
                                </div>
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
                {!vm.keyEntry && (
                    <ErrorMessage>
                        {intl.formatMessage({ id: 'ERROR_CUSTODIAN_KEY_NOT_FOUND' })}
                    </ErrorMessage>
                )}
                <Space direction="row" gap="s">
                    <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button
                        disabled={vm.isInsufficientBalance || !vm.keyEntry || !vm.fees}
                        loading={vm.loading}
                        onClick={() => ref.current?.submit()}
                    >
                        {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
