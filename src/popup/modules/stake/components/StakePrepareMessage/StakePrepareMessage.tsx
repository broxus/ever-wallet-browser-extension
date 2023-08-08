import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { Button, Container, Content, Footer, Header, Navbar, Tabs, UserInfo, useViewModel } from '@app/popup/modules/shared'

import { StakeForm } from '../StakeForm'
import { UnstakeForm } from '../UnstakeForm'
import { WithdrawRequestList } from '../WithdrawRequestList'
import { StakePrepareMessageViewModel, Tab } from './StakePrepareMessageViewModel'
import styles from './StakePrepareMessage.module.scss'

export const StakePrepareMessage = observer((): JSX.Element => {
    const vm = useViewModel(StakePrepareMessageViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    <UserInfo account={vm.transfer.account} />
                </Navbar>
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'STAKE_PAGE_HEADER' })}</h2>
                <p className={styles.hint}>
                    <FormattedMessage
                        id="STAKE_PAGE_SUBHEADER"
                        values={{
                            a: (...parts) => (
                                <Link to="/tutorial">{parts}</Link>
                            ),
                        }}
                    />
                </p>

                <Tabs
                    compact
                    className={styles.tabs}
                    tab={vm.tab.value}
                    onChange={vm.handleTabChange}
                >
                    <Tabs.Tab id={Tab.Stake}>
                        {intl.formatMessage({ id: 'STAKE_TAB_STAKE' })}
                    </Tabs.Tab>
                    <Tabs.Tab id={Tab.Unstake}>
                        {intl.formatMessage({ id: 'STAKE_TAB_UNSTAKE' })}
                    </Tabs.Tab>
                    {(vm.withdrawRequests.length || vm.tab.is(Tab.InProgress)) && (
                        <Tabs.Tab id={Tab.InProgress}>
                            {intl.formatMessage({ id: 'STAKE_TAB_IN_PROGRESS' })}
                            <span className={styles.label}>
                                {vm.withdrawRequests.length ?? 0}
                            </span>
                        </Tabs.Tab>
                    )}
                </Tabs>

                {vm.tab.is(Tab.Stake) && (
                    <StakeForm onSubmit={vm.submitMessageParams} />
                )}
                {vm.tab.is(Tab.Unstake) && (
                    <UnstakeForm onSubmit={vm.submitMessageParams} />
                )}
                {vm.tab.is(Tab.InProgress) && (
                    <WithdrawRequestList onRemove={vm.removePendingWithdraw} />
                )}
            </Content>

            <Footer>
                {!vm.tab.is(Tab.InProgress) && (
                    <Button form="stake" type="submit" disabled={!vm.transfer.key}>
                        {vm.tab.is(Tab.Stake)
                            ? intl.formatMessage({ id: 'STAKE_BTN_TEXT' })
                            : intl.formatMessage({ id: 'UNSTAKE_BTN_TEXT' })}
                    </Button>
                )}
            </Footer>
        </Container>
    )
})
