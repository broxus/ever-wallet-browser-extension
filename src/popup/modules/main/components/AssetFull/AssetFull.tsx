import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import DeployIcon from '@app/popup/assets/img/deploy-white.svg'
import ArrowDownIcon from '@app/popup/assets/icons/arrow-down.svg'
import ArrowUpIcon from '@app/popup/assets/icons/arrow-up.svg'
import { DeployWallet } from '@app/popup/modules/deploy'
import { Container, Content, Header, IconButton, Navbar, SlidingPanel, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency, isSubmitTransaction } from '@app/shared'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'

import { MultisigTransaction } from '../MultisigTransaction'
import { Receive } from '../Receive'
import { TransactionInfo } from '../TransactionInfo'
import { TransactionList } from '../TransactionList'
import { AssetFullViewModel, Panel } from './AssetFullViewModel'

import './AssetFull.scss'

export const AssetFull = observer((): JSX.Element => {
    const vm = useViewModel(AssetFullViewModel)
    const intl = useIntl()

    return (
        <>
            <Container className="asset-full">
                <Header>
                    <Navbar back="/" />
                </Header>

                <Content>
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
                                <IconButton icon={<ArrowDownIcon />} onClick={vm.onReceive} />
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

            <SlidingPanel active={vm.panel.value !== undefined} onClose={vm.closePanel}>
                {vm.panel.is(Panel.Receive) && (
                    <Receive
                        address={vm.account.tonWallet.address}
                        symbol={vm.currencyName}
                    />
                )}
                {vm.panel.is(Panel.Deploy) && <DeployWallet />}
                {vm.panel.is(Panel.Transaction) && vm.selectedTransaction
                    && (isSubmitTransaction(vm.selectedTransaction) ? (
                        <MultisigTransaction
                            transaction={vm.selectedTransaction}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ) : (
                        <TransactionInfo
                            transaction={vm.selectedTransaction}
                            symbol={vm.symbol}
                            token={vm.token}
                            nativeCurrency={vm.nativeCurrency}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ))}
                {vm.panel.is(Panel.VerifyAddress) && vm.addressToVerify && (
                    <LedgerVerifyAddress address={vm.addressToVerify} onBack={vm.closePanel} />
                )}
            </SlidingPanel>
        </>
    )
})
