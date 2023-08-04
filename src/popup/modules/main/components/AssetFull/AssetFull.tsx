import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import DeployIcon from '@app/popup/assets/icons/settings.svg'
import ArrowDownIcon from '@app/popup/assets/icons/arrow-down.svg'
import ArrowUpIcon from '@app/popup/assets/icons/arrow-up.svg'
import { Container, Content, Header, IconButton, Navbar, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency } from '@app/shared'

import { Receive } from '../Receive'
import { TransactionList } from '../TransactionList'
import { AssetFullViewModel } from './AssetFullViewModel'

import './AssetFull.scss'

export const AssetFull = observer((): JSX.Element => {
    const vm = useViewModel(AssetFullViewModel)
    const intl = useIntl()

    const handleReceive = useCallback(() => vm.panel.open({
        render: () => <Receive address={vm.account.tonWallet.address} symbol={vm.currencyName} />,
    }), [])

    return (
        <Container className="asset-full">
            <Header>
                <Navbar back="/" />
            </Header>

            <Content className="asset-full__content">
                <div className="asset-full__top">
                    <div className="asset-full__info">
                        <div className="asset-full__info-name">
                            {vm.account.name || convertAddress(vm.account.tonWallet.address)}
                        </div>
                        <h1 className="asset-full__info-balance">
                            <span className="asset-full__info-balance-value">
                                {vm.decimals != null && convertCurrency(vm.balance || '0', vm.decimals)}
                            </span>
                            &nbsp;
                            <span className="asset-full__info-balance-label">
                                {vm.currencyName}
                            </span>
                        </h1>
                        {vm.balanceUsd && (
                            <div className="asset-full__info-balance _usd">
                                <span className="asset-full__info-balance-value" title={vm.balanceUsd}>
                                    {vm.balanceUsd}
                                </span>
                                &nbsp;
                                <span className="asset-full__info-balance-label">
                                    USD
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="asset-full__buttons">
                        <label className="asset-full__buttons-label">
                            <IconButton icon={<ArrowDownIcon />} onClick={handleReceive} />
                            {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
                        </label>

                        {vm.showSendButton && vm.shouldDeploy && (
                            <label className="asset-full__buttons-label">
                                <IconButton icon={<DeployIcon />} onClick={vm.onDeploy} />
                                {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                            </label>
                        )}

                        {vm.showSendButton && !vm.shouldDeploy && (
                            <label className="asset-full__buttons-label">
                                <IconButton icon={<ArrowUpIcon />} onClick={vm.onSend} />
                                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                            </label>
                        )}
                    </div>
                </div>

                <div className="asset-full__history">
                    <h2>{intl.formatMessage({ id: 'TRANSACTION_HISTORY_TITLE' })}</h2>
                    <TransactionList
                        everWalletAsset={vm.everWalletAsset}
                        symbol={vm.symbol}
                        transactions={vm.transactions}
                        pendingTransactions={vm.pendingTransactions}
                        preloadTransactions={vm.preloadTransactions}
                        onViewTransaction={vm.showTransaction}
                    />
                </div>
            </Content>
        </Container>
    )
})
