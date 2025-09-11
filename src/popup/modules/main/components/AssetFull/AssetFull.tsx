import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { Icons } from '@app/popup/icons'
import { Amount, AssetIcon, Container, Content, Header, IconButton, Navbar, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency } from '@app/shared'
import { Page } from '@app/popup/modules/shared/components/Page'
import { usePage } from '@app/popup/modules/shared/hooks/usePage'

import { Receive } from '../Receive'
import { TransactionList } from '../TransactionList'
import { AssetFullViewModel } from './AssetFullViewModel'
import styles from './AssetFull.module.scss'

export const AssetFull = observer((): JSX.Element => {
    const vm = useViewModel(AssetFullViewModel)
    const navigate = useNavigate()
    const page = usePage()
    const intl = useIntl()

    const handleReceive = useCallback(() => vm.panel.open({
        showClose:  false,
        render: () => <Receive address={vm.account.tonWallet.address} symbol={vm.currencyName} />,
    }), [])

    // const handleViewTransaction = useCallback((transaction: nt.Transaction) => vm.panel.open({
    //     render: () => <TransactionInfo asset={vm.selectedAsset} hash={transaction.id.hash} />,
    // }), [])

    const handleViewTransaction = (trx: nt.Transaction) => {
        if (vm.root) {
            navigate(`/dashboard/assets/${vm.root}/${trx.id.hash}`)
        }
    }

    return (
        <Page animated id="asset-page" page={page}>
            <Container className={styles.container}>
                <Header className={styles.header}>
                    <Navbar back={page.close(() => navigate(-1))}>
                        {vm.currencyFullName}
                    </Navbar>
                </Header>

                <Content className={styles.content}>
                    {vm.selectedAsset.type === 'ever_wallet' ? (
                        <AssetIcon
                            className={styles.logo}
                            type="ever_wallet"
                        />
                    ) : (
                        <AssetIcon
                            className={styles.logo}
                            type="token_wallet"
                            address={vm.selectedAsset.data.rootTokenContract}
                            old={vm.old}
                        />
                    )}

                    <div className={styles.balance}>
                        {vm.decimals ? (
                            <Amount
                                value={convertCurrency(vm.balance || '0', vm.decimals)}
                                intClassName={styles.int}
                                fracClassName={styles.frac}
                            />
                        ) : '\u200B'}
                    </div>

                    <div className={styles.usd}>
                        {vm.balanceUsd ? (
                            <Amount value={vm.balanceUsd} prefix="$" isFiat />
                        ) : '\u200B'}
                    </div>

                    <div className={styles.actions}>
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

                    <TransactionList
                        everWalletAsset={vm.everWalletAsset}
                        symbol={vm.symbol}
                        transactions={vm.transactions}
                        pendingTransactions={vm.pendingTransactions}
                        preloadTransactions={vm.preloadTransactions}
                        onViewTransaction={handleViewTransaction}
                    />
                </Content>
            </Container>
            <Outlet />
        </Page>
    )
})
