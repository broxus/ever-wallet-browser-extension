import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertEvers } from '@app/shared'
import { Amount, AssetIcon, Button, Card, Checkbox, Container, Content, Footer, Header, Navbar, ParamsPanel, UserInfo, useViewModel } from '@app/popup/modules/shared'

import { AccountsList } from '../AccountsList'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveRequestPermissionsViewModel, Step } from './ApproveRequestPermissionsViewModel'
import styles from './ApproveRequestPermissions.module.scss'

export const ApproveRequestPermissions = observer((): JSX.Element => {
    const vm = useViewModel(ApproveRequestPermissionsViewModel)
    const intl = useIntl()

    return (
        <Container>
            {vm.step.is(Step.SelectAccount) && (
                <>
                    <Header>
                        <Navbar close="window">
                            {intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_HEADER' })}
                        </Navbar>
                        <Card size="s" className={styles.website}>
                            <WebsiteIcon iconSize="l" origin={vm.approval.origin} />
                        </Card>
                    </Header>

                    <Content>
                        <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
                    </Content>

                    <Footer>
                        <Button disabled={!vm.selectedAccount} onClick={vm.step.callback(Step.Confirm)}>
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.Confirm) && vm.selectedAccount && (
                <>
                    <Header>
                        <Navbar back={vm.shouldSelectAccount ? vm.step.callback(Step.SelectAccount) : undefined}>
                            {intl.formatMessage(
                                { id: 'APPROVE_REQUEST_PERMISSIONS_CONNECTED_TO' },
                                { name: vm.selectedAccount?.name || '' },
                            )}
                        </Navbar>
                    </Header>

                    <Content>
                        <ParamsPanel>
                            <ParamsPanel.Param>
                                <UserInfo account={vm.selectedAccount} />
                            </ParamsPanel.Param>
                            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                                <WebsiteIcon origin={vm.approval.origin} />
                            </ParamsPanel.Param>
                            <ParamsPanel.Param
                                bold
                                label={intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_BALANCE_LABEL' })}
                            >
                                <Amount
                                    precise
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(vm.balance)}
                                    currency={vm.nativeCurrency}
                                />
                            </ParamsPanel.Param>
                            <ParamsPanel.Param
                                label={intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_PERMISSIONS_SUBHEADING' })}
                            >
                                <Checkbox
                                    labelPosition="before"
                                    className={styles.checkbox}
                                    checked={vm.confirmChecked}
                                    onChange={(e) => vm.setConfirmChecked(e.target.checked)}
                                >
                                    {vm.permissions}
                                </Checkbox>
                            </ParamsPanel.Param>
                        </ParamsPanel>
                    </Content>

                    <Footer>
                        <Button
                            disabled={!vm.confirmChecked || (vm.shouldSelectAccount && !vm.selectedAccount)}
                            loading={vm.loading}
                            onClick={vm.onSubmit}
                        >
                            {intl.formatMessage({ id: 'CONNECT_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </>
            )}
        </Container>
    )
})
