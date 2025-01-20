import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useState } from 'react'

import { Button, Container, Content, Footer, Header, Icon, Navbar, Tabs, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { StakeForm } from '../StakeForm'
import { UnstakeForm } from '../UnstakeForm'
import { WithdrawRequestList } from '../WithdrawRequestList'
import { StakePrepareMessageViewModel, Tab } from './StakePrepareMessageViewModel'
import styles from './StakePrepareMessage.module.scss'
import { StakeTutorial } from '../StakeTutorial'

export const StakePrepareMessage = observer((): JSX.Element => {
    const vm = useViewModel(StakePrepareMessageViewModel)
    const intl = useIntl()
    const [isOpenInfo, setIsOpenInfo] = useState(false)

    return (
        <>

            <Container>
                <Header>
                    <Navbar
                        close="window" info={(
                            <Button
                                size="s"
                                shape="icon"
                                design="transparency"
                                onClick={() => setIsOpenInfo(true)}
                            >
                                <Icon icon="info" width={16} height={16} />
                            </Button>
                        )}
                    >
                        <div className={styles.header}>
                            {intl.formatMessage({ id: 'STAKE_PAGE_HEADER' })}
                        </div>
                    </Navbar>
                </Header>

                <Content>
                    <Tabs
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

                <Footer layer background>

                    {!vm.tab.is(Tab.InProgress) && (
                        <FooterAction>
                            <Button
                                width={232} form="stake" type="submit"
                                disabled={!vm.transfer.key}
                            >
                                {vm.tab.is(Tab.Stake)
                                    ? intl.formatMessage({ id: 'STAKE_BTN_TEXT' })
                                    : intl.formatMessage({ id: 'UNSTAKE_BTN_TEXT' })}
                            </Button>
                        </FooterAction>
                    )}

                </Footer>
            </Container>
            <StakeTutorial onClose={() => setIsOpenInfo(false)} active={isOpenInfo}/>
        </>
    )
})
