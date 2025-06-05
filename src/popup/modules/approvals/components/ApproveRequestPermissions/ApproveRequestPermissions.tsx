import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { closeCurrentWindow } from '@app/shared'
import { Button, Card, Checkbox, Container, Content, Footer, Header, Navbar, SearchInput, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { AccountsList } from '../AccountsList'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveRequestPermissionsViewModel, Step } from './ApproveRequestPermissionsViewModel'
import styles from './ApproveRequestPermissions.module.scss'
import { AccountsListViewModel } from '../AccountsList/AccountsListViewModel'

export const ApproveRequestPermissions = observer((): JSX.Element => {
    const vm = useViewModel(ApproveRequestPermissionsViewModel)
    const vmAcc = useViewModel(AccountsListViewModel)
    const intl = useIntl()

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
                        <SearchInput size="xs" value={vmAcc.search} onChange={vmAcc.handleSearch} />
                    </Header>

                    <Content className={styles.content}>
                        <AccountsList
                            selectedAccount={vm.selectedAccount}
                            onSelect={vm.setSelectedAccount}
                            vm={vmAcc}
                        />
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
                        <Navbar back={vm.shouldSelectAccount ? vm.step.callback(Step.SelectAccount) : undefined}>
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

                        <Data
                            dir="v"
                            label={intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_PERMISSIONS_SUBHEADING' })}
                            value={(
                                <Checkbox
                                    labelPosition="after"
                                    className={styles.checkbox}
                                    checked={vm.confirmChecked}
                                    onChange={(e) => vm.setConfirmChecked(e.target.checked)}
                                >
                                    {vm.permissions}
                                </Checkbox>
                            )}
                        />
                    </Content>

                    <Footer layer>
                        <FooterAction>
                            {vm.shouldSelectAccount ? (
                                <Button design="neutral" onClick={vm.step.callback(Step.SelectAccount)}>
                                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                                </Button>
                            ) : (
                                <Button design="neutral" onClick={closeCurrentWindow}>
                                    {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                                </Button>
                            )}

                            <Button
                                design="accent"
                                disabled={!vm.confirmChecked || (vm.shouldSelectAccount && !vm.selectedAccount)}
                                loading={vm.loading}
                                onClick={vm.onSubmit}
                            >
                                {intl.formatMessage({ id: 'CONNECT_BTN_TEXT' })}
                            </Button>
                        </FooterAction>
                    </Footer>
                </>
            )}
        </Container>
    )
})
