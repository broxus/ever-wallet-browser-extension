import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Button, Card, Container, Content, Footer, Header, Navbar, PageLoader, PasswordForm, Space, Tabs, usePasswordForm, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'
import { Data } from '@app/popup/modules/shared/components/Data'
import { DisplayType } from '@app/popup/modules/approvals/utils'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveSignDataViewModel } from './ApproveSignDataViewModel'
import styles from './ApproveSignData.module.scss'

export const ApproveSignData = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveSignDataViewModel)
    const intl = useIntl()
    const { form, isValid, handleSubmit } = usePasswordForm(vm.keyEntry)

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

            <Header>
                <Navbar>
                    {intl.formatMessage({ id: 'APPROVE_SIGN_DATA_APPROVAL_TITLE' })}
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
                        label={intl.formatMessage({
                            id: 'DATA',
                        })}
                        value={(
                            <Space direction="column" gap="s">
                                <Tabs tab={vm.displayType} onChange={vm.setDisplayType} className={styles.tabs}>
                                    {Object.values(DisplayType).map(type => (
                                        <Tabs.Tab id={type} key={type}>
                                            {type.toUpperCase()}
                                        </Tabs.Tab>
                                    ))}
                                </Tabs>
                                {vm.data}
                            </Space>
                        )}
                    />
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
                            {intl.formatMessage({ id: 'SIGN_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                </Space>
            </Footer>
        </Container>
    )
})
