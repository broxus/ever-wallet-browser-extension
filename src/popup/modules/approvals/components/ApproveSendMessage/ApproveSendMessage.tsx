/* eslint-disable max-len */
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

import { LedgerConnector } from '@app/popup/modules/ledger'
import {
    Amount,
    AssetIcon,
    Button,
    Card,
    ConnectionStore,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Navbar,
    PageLoader,
    PasswordForm,
    Space,
    TransactionTreeSimulationErrorPanel,
    usePasswordForm,
    useResolve,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertCurrency, convertEvers } from '@app/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { ParamsView } from '../ParamsView'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveSendMessageViewModel } from './ApproveSendMessageViewModel'
import styles from './ApproveSendMessage.module.scss'

export const ApproveSendMessage = observer((): JSX.Element | null => {
    const { symbol } = useResolve(ConnectionStore)
    const vm = useViewModel(ApproveSendMessageViewModel)
    const [txErrorConfirmed, setTxErrorConfirmed] = useState(false)
    const intl = useIntl()
    const { form, isValid, handleSubmit } = usePasswordForm(vm.keyEntry)
    const hasTxError = vm.txErrors.length > 0

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

            <Header>
                <Navbar>
                    {intl.formatMessage({ id: 'SEND_MESSAGE_PANEL_ENTER_ADDRESS_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <Card size="s" bg="layer-1" className={styles.user}>
                    <UserInfo account={vm.account} />
                </Card>

                <Space direction="column" gap="m">
                    <Data
                        dir="v"
                        label={intl.formatMessage({
                            id: 'WEBSITE',
                        })}
                        value={(
                            <WebsiteIcon iconSize="m" origin={vm.approval.origin} />
                        )}
                    />

                    <hr />

                    <Data
                        dir="v"
                        label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}
                        value={vm.approval.requestData.recipient}
                    />

                    {vm.tokenTransaction && (
                        <>
                            <hr />

                            <Space direction="column" gap="xs">
                                <Data
                                    dir="v"
                                    label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}
                                    value={(
                                        <Amount
                                            icon={<AssetIcon type="token_wallet" address={vm.tokenTransaction.rootTokenContract} />}
                                            value={convertCurrency(vm.tokenTransaction.amount, vm.tokenTransaction.decimals)}
                                            currency={vm.tokenTransaction.symbol}
                                        />
                                    )}
                                />
                                {!vm.isDeployed && (
                                    <ErrorMessage>
                                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_OPERATION_NOT_POSSIBLE' })}
                                    </ErrorMessage>
                                )}
                            </Space>
                        </>
                    )}

                    <hr />

                    <Data
                        label={!vm.tokenTransaction
                            ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })
                            : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                        value={(
                            <Space direction="column" gap="xs">
                                <Amount
                                    precise
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(vm.approval.requestData.amount)}
                                    currency={vm.nativeCurrency}
                                />
                                {vm.isInsufficientBalance && (
                                    <ErrorMessage>
                                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_INSUFFICIENT_FUNDS' })}
                                    </ErrorMessage>
                                )}
                            </Space>
                        )}
                    />

                    <hr />

                    <Data
                        label={intl.formatMessage({ id: 'NETWORK_FEE' })}
                        value={(
                            vm.fees
                                ? <Amount approx value={convertEvers(vm.fees)} currency={symbol} />
                                : intl.formatMessage({ id: 'CALCULATING_HINT' })
                        )}
                    />

                    {vm.approval.requestData.payload && (
                        <>
                            <hr />
                            <Data
                                label={intl.formatMessage({ id: 'METHOD' })}
                                value={vm.approval.requestData.payload.method}
                            />
                            <hr />
                            <Data
                                dir="v"
                                label={intl.formatMessage({ id: 'PARAMS' })}
                                value={(
                                    <ParamsView params={vm.approval.requestData.payload.params} />
                                )}
                            />
                        </>
                    )}
                </Space>
            </Content>

            <Footer layer>
                <Space direction="column" gap="l">
                    {hasTxError && (
                        <TransactionTreeSimulationErrorPanel
                            errors={vm.txErrors}
                            symbol={vm.nativeCurrency}
                            confirmed={txErrorConfirmed}
                            onConfirmChange={setTxErrorConfirmed}
                        />
                    )}

                    {vm.keyEntry && (
                        <PasswordForm
                            form={form}
                            error={vm.error}
                            keyEntry={vm.keyEntry}
                            keyEntries={vm.selectableKeys?.keys}
                            onSubmit={handleSubmit(vm.onSubmit)}
                            onChangeKeyEntry={vm.setKey}
                        />
                    )}

                    {!vm.keyEntry && (
                        <ErrorMessage>
                            {intl.formatMessage({ id: 'ERROR_CUSTODIAN_KEY_NOT_FOUND' })}
                        </ErrorMessage>
                    )}

                    <FooterAction
                        buttons={[
                            <Button design="neutral" disabled={vm.loading} onClick={vm.onReject}>
                                {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                            </Button>,
                            <Button
                                design="accent"
                                disabled={
                                    vm.isInsufficientBalance
                                    || !vm.keyEntry
                                    || !vm.fees
                                    || !isValid
                                    || (hasTxError && !txErrorConfirmed)
                                }
                                loading={vm.loading}
                                onClick={handleSubmit(vm.onSubmit)}
                            >
                                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                            </Button>,
                        ]}
                    />
                </Space>
            </Footer>
        </Container>
    )
})
