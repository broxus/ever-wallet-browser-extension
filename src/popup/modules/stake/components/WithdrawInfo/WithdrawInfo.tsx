import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { Amount, AssetIcon, Button, Card, Chips, Container, Content, CopyButton, Footer, Header, Icon, Navbar, Space, useResolve } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency, convertEvers, NATIVE_CURRENCY } from '@app/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { WithdrawInfoViewModel } from './WithdrawInfoViewModel'
import styles from './WithdrawInfo.module.scss'

export const WithdrawInfo = observer((): JSX.Element => {
    const vm = useResolve(WithdrawInfoViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    const handleRemove = async () => {
        vm.onRemove(vm.withdrawRequest)
    }

    const statusLabel = (
        <Chips type="warning">
            {intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKING_IN_PROGRESS' })}
        </Chips>
    )

    return (
        <Container>
            <Header>
                <Navbar back={() => navigate('/')}>
                    {intl.formatMessage({ id: 'DETAILS' })}
                </Navbar>
            </Header>


            <Content>
                <Card bg="layer-1" padding="m">
                    <Space gap="l" direction="column">
                        <Space direction="row" className={styles.row}>
                            {statusLabel}
                            <span className={styles.date}>
                                {new Date(vm.timestamp).toLocaleString()}
                            </span>
                        </Space>
                        <hr />
                        <div className={styles.info}>
                            {intl.formatMessage(
                                { id: 'STAKE_FORM_UNSTAKE_INFO' },
                                { hours: vm.withdrawTimeHours },
                            )}
                        </div>
                        <hr />
                        <Data
                            dir="h"
                            label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}
                            value={intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_TYPE_LIQUID_STAKING' })}
                        />
                        <Data
                            dir="h"
                            label={intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKE_AMOUNT' })}
                            value={(
                                <Amount
                                    icon={<AssetIcon type="token_wallet" address={vm.stEverTokenRoot} />}
                                    value={convertCurrency(vm.amount, vm.decimals)}
                                    currency={vm.currencyName}
                                />
                            )}
                        />
                        <Data
                            dir="h"
                            label={intl.formatMessage({ id: 'STAKE_FORM_EXCHANGE_RATE' })}
                            value={vm.exchangeRate && (
                                <span>1 stEVER ≈ {vm.exchangeRate} EVER</span>
                            )}
                        />
                        <Data
                            dir="h"
                            label={intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_RECEIVE' })}
                            value={vm.receive && (
                                <Amount
                                    icon={<AssetIcon type="ever_wallet" />}
                                    value={convertEvers(vm.receive)}
                                    currency={NATIVE_CURRENCY}
                                    approx
                                />
                            )}
                        />
                        <Data
                            dir="h"
                            label={intl.formatMessage({ id: 'TRANSACTION_TERM_TO' })}
                            value={(
                                <CopyButton text={vm.transfer.account.tonWallet.address}>
                                    <button type="button" className={styles.copy}>
                                        {convertAddress(vm.transfer.account.tonWallet.address)}
                                        <Icon
                                            icon="copy" className={styles.icon} width={16}
                                            height={16}
                                        />
                                    </button>
                                </CopyButton>

                            )}
                        />
                        <div className={styles.info}>
                            {intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_BTN_HINT' })}
                        </div>
                    </Space>
                </Card>


            </Content>

            <Footer layer>
                <FooterAction>
                    <Button design="destructive" onClick={handleRemove}>
                        {intl.formatMessage({ id: 'STAKE_WITHDRAW_CANCEL_BTN_TEXT' })}
                    </Button>
                </FooterAction>

            </Footer>
        </Container>
    )
})
