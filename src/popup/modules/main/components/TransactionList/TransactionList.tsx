import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { Virtuoso } from 'react-virtuoso'

import { Empty, useViewModel } from '@app/popup/modules/shared'
import { StoredBriefMessageInfo } from '@app/models'

import { Transaction } from './components/Transaction'
import { TransactionListViewModel } from './TransactionListViewModel'

import './TransactionList.scss'

interface Props {
    everWalletAsset: nt.TonWalletAsset;
    symbol?: nt.Symbol;
    transactions: nt.Transaction[];
    pendingTransactions?: StoredBriefMessageInfo[];
    onViewTransaction: (transaction: nt.Transaction) => void;
    preloadTransactions: (continuation: nt.TransactionId) => Promise<void>;
}

export const TransactionList = observer((props: Props) => {
    const {
        everWalletAsset,
        symbol,
        transactions,
        pendingTransactions,
        preloadTransactions,
        onViewTransaction,
    } = props

    const vm = useViewModel(TransactionListViewModel, model => {
        model.everWalletAsset = everWalletAsset
        model.transactions = transactions
        model.pendingTransactions = pendingTransactions
        model.preloadTransactions = preloadTransactions
    }, [everWalletAsset, transactions, pendingTransactions, preloadTransactions])

    // TODO: elements height
    // TODO: pending
    return (
        <Virtuoso
            useWindowScroll
            components={{ EmptyPlaceholder: Empty }}
            data={transactions}
            endReached={vm.tryPreloadTransactions}
            computeItemKey={(_, { id }) => id.hash}
            itemContent={(_, transaction) => (
                <Transaction
                    key={transaction.id.hash}
                    symbol={symbol}
                    transaction={transaction}
                    onViewTransaction={onViewTransaction}
                />
            )}
        />
    )
    // return (
    //     <div className="user-assets__transactions-list noselect">
    //         {pendingTransactions?.map(message => (
    //             <Message
    //                 everWalletAsset={everWalletAsset}
    //                 key={message.messageHash}
    //                 message={message}
    //                 nativeCurrency={vm.nativeCurrency}
    //             />
    //         ))}
    //         {!transactions.length && (
    //             <p className="transactions-list-empty">
    //                 {intl.formatMessage({ id: 'TRANSACTIONS_LIST_HISTORY_IS_EMPTY' })}
    //             </p>
    //         )}
    //         <div style={{ height: `${offsetHeight}px` }} />
    //         {slice.map(transaction => (
    //             <Transaction
    //                 key={transaction.id.hash}
    //                 symbol={symbol}
    //                 transaction={transaction}
    //                 onViewTransaction={onViewTransaction}
    //             />
    //         ))}
    //         {endIndex && <div style={{ height: `${vm.totalHeight - maxVisibleHeight}px` }} />}
    //     </div>
    // )
})
