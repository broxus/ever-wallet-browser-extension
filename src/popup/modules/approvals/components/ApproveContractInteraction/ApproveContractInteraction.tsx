import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, PageLoader, ParamsPanel, PasswordForm, Space, usePasswordForm, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { ParamsView } from '@app/popup/modules/approvals/components/ParamsView'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { ApprovalNetwork } from '../ApprovalNetwork'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveContractInteractionViewModel } from './ApproveContractInteractionViewModel'
import styles from './ApproveContractInteraction.module.scss'

export const ApproveContractInteraction = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveContractInteractionViewModel)
    const intl = useIntl()
    const { form, isValid, handleSubmit } = usePasswordForm(vm.keyEntry)

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account) return null

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
                    <ParamsPanel>
                        <ParamsPanel.Param>
                            <UserInfo account={vm.account} />
                        </ParamsPanel.Param>
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                            <WebsiteIcon origin={vm.approval.origin} />
                        </ParamsPanel.Param>

                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_TERM_CONTRACT' })}>
                            {vm.approval.requestData.recipient}
                        </ParamsPanel.Param>
                    </ParamsPanel>

                    {vm.approval.requestData.payload && (
                        <ParamsPanel
                            collapsible
                            title={(
                                <div className={styles.data}>
                                    <div className={styles.label}>
                                        {intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_TERM_DATA' })}
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

            <Footer background>
                <Space direction="column" gap="m">
                    <PasswordForm
                        form={form}
                        error={vm.error}
                        keyEntry={vm.keyEntry}
                        onSubmit={handleSubmit(vm.onSubmit)}
                    />

                    <Space direction="row" gap="s">
                        <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                            {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                        </Button>
                        <Button disabled={!isValid} loading={vm.loading} onClick={handleSubmit(vm.onSubmit)}>
                            {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                        </Button>
                    </Space>
                </Space>
            </Footer>
        </Container>
    )
})
