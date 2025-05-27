import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { closeCurrentWindow } from '@app/shared'
import { Button, Card, Container, Content, ErrorMessage, Footer, Header, Navbar, PasswordForm, Space, usePasswordForm, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { AccountsList } from '../AccountsList'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveRequestTonConnectViewModel, Step } from './ApproveRequestTonConnectViewModel'
import styles from './ApproveRequestTonConnect.module.scss'

export const ApproveRequestTonConnect = observer((): JSX.Element => {
    const vm = useViewModel(ApproveRequestTonConnectViewModel)
    const intl = useIntl()

    const { form, isValid, handleSubmit } = usePasswordForm(vm.keyEntry)

    const disabled = !isValid || !vm.keyEntry

    return (
        <Container>
            {vm.step.is(Step.SelectAccount) && (
                <>
                    <Header className={styles.header}>
                        <Navbar>
                            {intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_HEADER' })}
                        </Navbar>
                        <Data
                            dir="v"
                            label={intl.formatMessage({
                                id: 'WEBSITE',
                            })}
                            value={(
                                <WebsiteIcon iconSize="m" origin={vm.approval.origin} />
                            )}
                        />
                    </Header>

                    <Content className={styles.content}>
                        <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
                    </Content>

                    <Footer layer>
                        <FooterAction>
                            <Button design="neutral" onClick={closeCurrentWindow}>
                                {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                            </Button>
                            <Button design="accent" disabled={!vm.selectedAccount} onClick={vm.step.callback(Step.Confirm)}>
                                {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                            </Button>
                        </FooterAction>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.Confirm) && vm.selectedAccount && (
                <>
                    <Header className={styles.header}>
                        <Navbar back={vm.shouldShowPassword ? vm.step.callback(Step.SelectAccount) : undefined}>
                            {intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_CONNECT_TO' })}
                        </Navbar>
                        <Data
                            dir="v"
                            label={intl.formatMessage({
                                id: 'WEBSITE',
                            })}
                            value={(
                                <WebsiteIcon iconSize="m" origin={vm.approval.origin} />
                            )}
                        />
                    </Header>

                    <Content className={styles.content}>
                        <Card
                            size="s" bg="layer-1" padding="xs"
                            className={styles.user}
                        >
                            <UserInfo account={vm.selectedAccount} />
                        </Card>
                    </Content>

                    <Footer layer>
                        <Space direction="column" gap="l">

                            {vm.keyEntry && vm.shouldShowPassword && (
                                <PasswordForm
                                    form={form}
                                    error={vm.error}
                                    keyEntry={vm.keyEntry}
                                    submitDisabled={disabled}
                                    onSubmit={handleSubmit(vm.onSubmit)}
                                />
                            )}

                            {!vm.keyEntry && (
                                <ErrorMessage>
                                    {intl.formatMessage({ id: 'ERROR_CUSTODIAN_KEY_NOT_FOUND' })}
                                </ErrorMessage>
                            )}
                            <FooterAction>
                                <Button design="neutral" onClick={vm.step.callback(Step.SelectAccount)}>
                                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                                </Button>

                                <Button
                                    design="accent"
                                    disabled={disabled}
                                    loading={vm.loading}
                                    onClick={vm.shouldShowPassword ? handleSubmit(vm.onSubmit) : () => vm.onSubmit()}
                                >
                                    {intl.formatMessage({ id: 'CONNECT_BTN_TEXT' })}
                                </Button>
                            </FooterAction>
                        </Space>
                    </Footer>
                </>
            )}
        </Container>
    )
})
