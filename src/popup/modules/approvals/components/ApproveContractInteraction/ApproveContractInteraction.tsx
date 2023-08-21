import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, PageLoader, ParamsPanel, Space, useEnterPassword, usePasswordCache, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { ParamsView } from '@app/popup/modules/approvals/components/ParamsView'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { ApprovalNetwork } from '../ApprovalNetwork'
import { ApproveContractInteractionViewModel } from './ApproveContractInteractionViewModel'

export const ApproveContractInteraction = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveContractInteractionViewModel)
    const intl = useIntl()
    const passwordCached = usePasswordCache(vm.approval.requestData.publicKey)
    const enterPassword = useEnterPassword({
        keyEntry: vm.keyEntry,
        error: vm.error,
        loading: vm.loading,
        onSubmit: vm.onSubmit,
    })

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
                    <h2>{intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_APPROVAL_TITLE' })}</h2>

                    <ParamsPanel>
                        <ParamsPanel.Param>
                            <UserInfo account={vm.account} />
                        </ParamsPanel.Param>
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                            {vm.approval.origin}
                        </ParamsPanel.Param>

                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_TERM_CONTRACT' })}>
                            {vm.approval.requestData.recipient}
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
                <Space direction="row" gap="s">
                    <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button
                        disabled={vm.loading || passwordCached == null}
                        onClick={() => (passwordCached ? vm.onSubmit() : enterPassword.show())}
                    >
                        {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
