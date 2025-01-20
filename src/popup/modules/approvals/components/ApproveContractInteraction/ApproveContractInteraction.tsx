import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Button, Card, Container, Content, Footer, Header, Navbar, PageLoader, PasswordForm, Space, usePasswordForm, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { ParamsView } from '@app/popup/modules/approvals/components/ParamsView'
import { LedgerConnector } from '@app/popup/modules/ledger'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

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

            <Header>
                <Navbar>
                    {intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_APPROVAL_TITLE' })}
                </Navbar>
            </Header>

            <Content>
                <Card
                    size="s" bg="layer-1" padding="xs"
                    className={styles.user}
                >
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

                    {vm.approval.requestData.payload && (
                        <>
                            <hr />
                            <ParamsView
                                params={{
                                    [intl.formatMessage({ id: 'METHOD' }).toLowerCase()]: vm.approval.requestData.payload.method,
                                    ...vm.approval.requestData.payload.params,
                                }}
                            />
                        </>
                    )}
                </Space>
            </Content>

            <Footer layer>
                <Space direction="column" gap="l">
                    <PasswordForm
                        form={form}
                        error={vm.error}
                        keyEntry={vm.keyEntry}
                        onSubmit={handleSubmit(vm.onSubmit)}
                    />

                    <FooterAction>
                        <Button design="neutral" disabled={vm.loading} onClick={vm.onReject}>
                            {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                        </Button>
                        <Button
                            design="accent" disabled={!isValid} loading={vm.loading}
                            onClick={handleSubmit(vm.onSubmit)}
                        >
                            {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                </Space>
            </Footer>
        </Container>
    )
})
