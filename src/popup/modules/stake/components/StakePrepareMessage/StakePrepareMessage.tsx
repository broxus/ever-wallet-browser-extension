import { observer } from 'mobx-react-lite'
import { MouseEvent, useCallback } from 'react'
import { useIntl } from 'react-intl'

import { LedgerConnector } from '@app/popup/modules/ledger'
import { EnterSendPassword } from '@app/popup/modules/send'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    DrawerPanelProvider,
    Footer,
    Header,
    Loader,
    Panel,
    Tabs,
    useDrawerPanel,
    usePasswordCache,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'

import { StakeResult } from '../StakeResult'
import { StakeForm } from '../StakeForm'
import { UnstakeForm } from '../UnstakeForm'
import { WithdrawRequestList } from '../WithdrawRequestList'
import { StakePrepareMessageViewModel, Step, Tab } from './StakePrepareMessageViewModel'
import './StakePrepareMessage.scss'

interface Props {
    onBack: () => void;
    onNext: () => void;
}

export const StakePrepareMessage = observer(({ onBack, onNext }: Props): JSX.Element | null => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(StakePrepareMessageViewModel)
    const intl = useIntl()
    const passwordCached = usePasswordCache(vm.selectedKey?.publicKey)

    const handleSubtitleClick = useCallback((e: MouseEvent) => {
        e.preventDefault()

        if (e.target instanceof HTMLAnchorElement) {
            drawer.setPanel(Panel.STAKE_TUTORIAL)
        }
    }, [])

    if (vm.step.is(Step.LedgerConnect)) {
        return (
            <LedgerConnector onNext={vm.step.setEnterAmount} onBack={vm.step.setEnterAmount} />
        )
    }

    return (
        <Container className="stake-prepare-message">
            {vm.ledgerLoading && (
                <div className="stake-prepare-message__loader">
                    <Loader />
                </div>
            )}

            <Header>
                {vm.step.is(Step.EnterAmount) && (
                    <>
                        <h2 className="stake-prepare-message__header-title">
                            {intl.formatMessage({ id: 'STAKE_PAGE_HEADER' })}
                        </h2>
                        <p
                            className="stake-prepare-message__header-subtitle"
                            dangerouslySetInnerHTML={{
                                __html: intl.formatMessage({ id: 'STAKE_PAGE_SUBHEADER' }),
                            }}
                            onClick={handleSubtitleClick}
                        />
                    </>
                )}
                {vm.step.is(Step.EnterPassword) && passwordCached != null && (
                    <>
                        <UserInfo className="stake-prepare-message__user-info" account={vm.selectedAccount} />
                        <h2 className="stake-prepare-message__header-title">
                            {passwordCached
                                ? intl.formatMessage({ id: 'STAKE_CONFIRM_TRANSACTION_HEADER' })
                                : intl.formatMessage({ id: 'STAKE_ENTER_PASSWORD_HEADER' })}
                        </h2>
                    </>
                )}
            </Header>

            {vm.step.is(Step.EnterAmount) && (
                <>
                    <Content className="stake-prepare-message__content">
                        <Tabs className="stake-prepare-message__tabs" tab={vm.tab.value} onChange={vm.handleTabChange}>
                            <Tabs.Tab id={Tab.Stake}>
                                {intl.formatMessage({ id: 'STAKE_TAB_STAKE' })}
                            </Tabs.Tab>
                            <Tabs.Tab id={Tab.Unstake}>
                                {intl.formatMessage({ id: 'STAKE_TAB_UNSTAKE' })}
                            </Tabs.Tab>
                            {(vm.withdrawRequests.length || vm.tab.is(Tab.InProgress)) && (
                                <Tabs.Tab id={Tab.InProgress} className="stake-prepare-message__tabs-item">
                                    {intl.formatMessage({ id: 'STAKE_TAB_IN_PROGRESS' })}
                                    <span className="stake-prepare-message__tabs-label">
                                        {vm.withdrawRequests.length ?? 0}
                                    </span>
                                </Tabs.Tab>
                            )}
                        </Tabs>

                        {vm.tab.is(Tab.Stake) && (
                            <StakeForm
                                selectedAccount={vm.selectedAccount}
                                amount={vm.messageParams?.originalAmount}
                                onSubmit={vm.submitMessageParams}
                            />
                        )}
                        {vm.tab.is(Tab.Unstake) && (
                            <UnstakeForm
                                balance={vm.stEverBalance}
                                selectedAccount={vm.selectedAccount}
                                amount={vm.messageParams?.originalAmount}
                                onSubmit={vm.submitMessageParams}
                            />
                        )}
                        {vm.tab.is(Tab.InProgress) && (
                            <DrawerPanelProvider>
                                <WithdrawRequestList
                                    selectedAccount={vm.selectedAccount}
                                    onRemove={vm.removePendingWithdraw}
                                />
                            </DrawerPanelProvider>
                        )}
                    </Content>

                    <Footer>
                        <ButtonGroup>
                            <Button group="small" design="secondary" onClick={onBack}>
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </Button>
                            {!vm.tab.is(Tab.InProgress) && (
                                <Button form="stake" type="submit" disabled={!vm.selectedKey}>
                                    {vm.tab.is(Tab.Stake)
                                        ? intl.formatMessage({ id: 'STAKE_BTN_TEXT' })
                                        : intl.formatMessage({ id: 'UNSTAKE_BTN_TEXT' })}
                                </Button>
                            )}
                        </ButtonGroup>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.EnterPassword) && vm.selectedKey && (
                <EnterSendPassword
                    keyEntries={vm.selectableKeys.keys}
                    keyEntry={vm.selectedKey}
                    amount={vm.messageParams?.amount}
                    recipient={vm.messageToPrepare?.recipient}
                    masterKeysNames={vm.masterKeysNames}
                    fees={vm.fees}
                    error={vm.error}
                    balanceError={vm.balanceError}
                    disabled={vm.loading}
                    onSubmit={vm.submitPassword}
                    onBack={vm.step.setEnterAmount}
                    onChangeKeyEntry={vm.onChangeKeyEntry}
                />
            )}

            {vm.step.is(Step.StakeResult) && vm.messageParams && (
                <StakeResult type={vm.messageParams.action} onNext={onNext} />
            )}
        </Container>
    )
})
