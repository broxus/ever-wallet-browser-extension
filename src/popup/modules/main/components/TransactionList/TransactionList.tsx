import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useIntl } from 'react-intl'

import { useViewModel } from '@app/popup/modules/shared'
import { StoredBriefMessageInfo } from '@app/models'

import { useScrollArea } from '../ScrollArea'
import { Message } from './components/Message/Message'
import { Transaction } from './components/Transaction/Transaction'
import { TransactionListViewModel } from './TransactionListViewModel'

import './TransactionList.scss'

interface Props {
    everWalletAsset: nt.TonWalletAsset;
    topOffset: number;
    fullHeight: number;
    symbol?: nt.Symbol;
    transactions: nt.Transaction[];
    pendingTransactions?: StoredBriefMessageInfo[];
    onViewTransaction: (transaction: nt.Transaction) => void;
    preloadTransactions: (continuation: nt.TransactionId) => Promise<void>;
}

export const TransactionList = observer((props: Props) => {
    const {
        everWalletAsset,
        fullHeight,
        topOffset,
        symbol,
        transactions,
        pendingTransactions,
        preloadTransactions,
        onViewTransaction,
    } = props

    const scrollArea = useScrollArea()
    const vm = useViewModel(TransactionListViewModel, model => {
        model.everWalletAsset = everWalletAsset
        model.transactions = transactions
        model.pendingTransactions = pendingTransactions
        model.preloadTransactions = preloadTransactions
        model.scroll = scrollArea.current?.scrollTop ?? 0
    }, [everWalletAsset, transactions, pendingTransactions, preloadTransactions])
    const intl = useIntl()

    React.useEffect(() => {
        const onScroll = () => vm.setScroll(scrollArea.current?.scrollTop ?? 0)
        scrollArea.current?.addEventListener('scroll', onScroll)
        return () => scrollArea.current?.removeEventListener('scroll', onScroll)
    }, [scrollArea])

    const totalTopOffset = topOffset + vm.pendingTransactionsHeight
    const detailsPart = Math.max(totalTopOffset - vm.scroll, 0)
    const visibleHeight = fullHeight - detailsPart
    const hiddenHeight = Math.max(vm.scroll - totalTopOffset, 0)
    const maxHeight = hiddenHeight + visibleHeight

    let maxVisibleHeight = 0,
        offsetHeight = 0,
        startIndex: number | undefined,
        endIndex: number | undefined

    for (let i = 0; i < vm.transactionHeights.length; ++i) {
        const transactionHeight = vm.transactionHeights[i]

        // Just skip transactions after visible area
        if (endIndex !== undefined) {
            continue
        }

        // Set index for last transaction in visible area
        if (maxVisibleHeight >= maxHeight) {
            endIndex = i
            continue
        }

        // Set index for first transaction in visible area
        if (startIndex === undefined && maxVisibleHeight + transactionHeight >= hiddenHeight) {
            offsetHeight = maxVisibleHeight
            startIndex = i
        }

        // Increase visible area maximum height
        maxVisibleHeight += transactionHeight
    }

    const slice = transactions.slice(startIndex, endIndex)

    return (
        <div className="user-assets__transactions-list noselect">
            {pendingTransactions?.map(message => (
                <Message
                    everWalletAsset={everWalletAsset}
                    key={message.messageHash}
                    message={message}
                />
            ))}
            {!transactions.length && (
                <p className="transactions-list-empty">
                    {intl.formatMessage({ id: 'TRANSACTIONS_LIST_HISTORY_IS_EMPTY' })}
                </p>
            )}
            <div style={{ height: `${offsetHeight}px` }} />
            {slice.map(transaction => (
                <Transaction
                    key={transaction.id.hash}
                    symbol={symbol}
                    transaction={transaction}
                    onViewTransaction={onViewTransaction}
                />
            ))}
            {endIndex && <div style={{ height: `${vm.totalHeight - maxVisibleHeight}px` }} />}
        </div>
    )
})
