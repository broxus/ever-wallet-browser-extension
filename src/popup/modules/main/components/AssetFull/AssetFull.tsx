import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import { Icons } from '@app/popup/icons'
import { Amount, Button, Container, Content, Header, Navbar, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency } from '@app/shared'

import { Receive } from '../Receive'
import { TransactionList } from '../TransactionList'
import { AssetFullViewModel } from './AssetFullViewModel'
import styles from './AssetFull.module.scss'

export const AssetFull = observer((): JSX.Element => {
    const vm = useViewModel(AssetFullViewModel)
    const intl = useIntl()

    const handleReceive = useCallback(() => vm.panel.open({
        render: () => <Receive address={vm.account.tonWallet.address} symbol={vm.currencyName} />,
    }), [])

    return (
        <Container>
            <Header>
                <Navbar back="/">
                    <span className={styles.name}>
                        {vm.currencyFullName}
                    </span>
                </Navbar>
            </Header>

            <Content>
                <div>
                    <div className={styles.balance}>
                        {vm.decimals != null && (
                            <Amount
                                precise
                                value={convertCurrency(vm.balance || '0', vm.decimals)}
                                currency={vm.currencyName}
                            />
                        )}
                    </div>
                    {vm.balanceUsd && (
                        <div className={styles.usd}>
                            <Amount value={vm.balanceUsd} currency="USD" />
                        </div>
                    )}
                </div>

                <div className={styles.buttons}>
                    <Button size="m" className={styles.btn} onClick={handleReceive}>
                        {Icons.arrowDown}
                        {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
                    </Button>

                    {vm.showSendButton && vm.shouldDeploy && (
                        <Button size="m" className={styles.btn} onClick={vm.onDeploy}>
                            {Icons.settings}
                            {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                        </Button>
                    )}

                    {vm.showSendButton && !vm.shouldDeploy && (
                        <Button size="m" className={styles.btn} onClick={vm.onSend}>
                            {Icons.arrowUp}
                            {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                        </Button>
                    )}
                </div>

                <TransactionList
                    everWalletAsset={vm.everWalletAsset}
                    symbol={vm.symbol}
                    transactions={vm.transactions}
                    pendingTransactions={vm.pendingTransactions}
                    preloadTransactions={vm.preloadTransactions}
                    onViewTransaction={vm.showTransaction}
                />
            </Content>
        </Container>
    )
})
