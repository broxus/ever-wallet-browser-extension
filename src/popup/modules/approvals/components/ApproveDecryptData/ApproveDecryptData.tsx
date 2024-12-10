import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Button, Card, Container, Content, Footer, Header, Navbar, PageLoader, PasswordForm, Space, usePasswordForm, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveDecryptDataViewModel } from './ApproveDecryptDataViewModel'
import styles from './ApproveDecryptData.module.scss'

export const ApproveDecryptData = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveDecryptDataViewModel)
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
            // TODO: redesign
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
                    {intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_APPROVAL_TITLE' })}
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
                            id: 'APPROVE_DECRYPT_DATA_TERM_PUBLIC_KEY',
                        })}
                        value={vm.approval.requestData.sourcePublicKey}
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

                    <FooterAction
                        buttons={[
                            <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                                {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                            </Button>,
                            <Button disabled={!isValid} loading={vm.loading} onClick={handleSubmit(vm.onSubmit)}>
                                {intl.formatMessage({ id: 'DECRYPT_BTN_TEXT' })}
                            </Button>,
                        ]}
                    />
                </Space>
            </Footer>
        </Container>
    )
})
