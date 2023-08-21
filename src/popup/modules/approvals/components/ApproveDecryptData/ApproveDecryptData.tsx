import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, PageLoader, ParamsPanel, Space, useEnterPassword, usePasswordCache, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { ApproveDecryptDataViewModel } from './ApproveDecryptDataViewModel'
import { ApprovalNetwork } from '@app/popup/modules/approvals/components/ApprovalNetwork'

export const ApproveDecryptData = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveDecryptDataViewModel)
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

    if (!vm.account) return <PageLoader />

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
                    <h2>{intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_APPROVAL_TITLE' })}</h2>

                    <ParamsPanel>
                        <ParamsPanel.Param>
                            <UserInfo account={vm.account} />
                        </ParamsPanel.Param>
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                            {vm.approval.origin}
                        </ParamsPanel.Param>

                        <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_TERM_PUBLIC_KEY' })}>
                            {vm.approval.requestData.sourcePublicKey}
                        </ParamsPanel.Param>
                    </ParamsPanel>
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
                        {intl.formatMessage({ id: 'DECRYPT_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
