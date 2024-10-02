import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import { Icons } from '@app/popup/icons'
import { Amount, Container, Content, Header, IconButton, Navbar, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency } from '@app/shared'

import { Receive } from '../Receive'
import { TransactionList } from '../TransactionList'
import { TransactionInfo } from '../TransactionInfo'
import { AssetFullViewModel } from './AssetFullViewModel'
import styles from './AssetFull.module.scss'

export const AssetFull = observer((): JSX.Element => {
    const vm = useViewModel(AssetFullViewModel)
    const intl = useIntl()

    const handleReceive = useCallback(() => vm.panel.open({
        render: () => <Receive address={vm.account.tonWallet.address} symbol={vm.currencyName} />,
    }), [])

    const handleViewTransaction = useCallback((transaction: nt.Transaction) => vm.panel.open({
        render: () => <TransactionInfo asset={vm.selectedAsset} hash={transaction.id.hash} />,
    }), [])

    return (
        <Container className={styles.container}>
            <Header className={styles.header}>
                <Navbar back="/">
                    <span className={styles.name}>
                        {vm.currencyFullName}
                    </span>
                </Navbar>
            </Header>

            <Content className={styles.content}>
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
                            <Amount value={vm.balanceUsd} prefix="$" />
                        </div>
                    )}
                </div>

                <div className={styles.buttons}>
                    <label className={styles.label}>
                        <IconButton design="transparent" icon={Icons.arrowDown} onClick={handleReceive} />
                        {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
                    </label>

                    {vm.everWalletState && !vm.shouldDeploy && (
                        <label className={styles.label}>
                            <IconButton design="transparent" icon={Icons.arrowUp} onClick={vm.onSend} />
                            {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                        </label>
                    )}

                    {vm.everWalletState && vm.shouldDeploy && (
                        <label className={styles.label}>
                            <IconButton design="transparent" icon={Icons.settings} onClick={vm.onDeploy} />
                            {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                        </label>
                    )}
                </div>

                <div className={styles.trxList}>
                    <TransactionList
                        everWalletAsset={vm.everWalletAsset}
                        symbol={vm.symbol}
                        transactions={vm.transactions}
                        pendingTransactions={vm.pendingTransactions}
                        preloadTransactions={vm.preloadTransactions}
                        onViewTransaction={handleViewTransaction}
                    />
                </div>
            </Content>
        </Container>
    )
})
