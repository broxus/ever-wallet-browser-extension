import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { Components, GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso'
import { forwardRef, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router'

import { StoredBriefMessageInfo } from '@app/models'
import { isConfirmTransaction } from '@app/shared'
import { useViewModel } from '@app/popup/modules/shared'

import { Transaction, EmptyPlaceholder, Message } from './components'
import { TransactionListViewModel } from './TransactionListViewModel'
import styles from './TransactionList.module.scss'

interface Props {
    everWalletAsset: nt.TonWalletAsset;
    symbol?: nt.Symbol;
    transactions: nt.Transaction[];
    pendingTransactions?: StoredBriefMessageInfo[];
    onViewTransaction: (transaction: nt.Transaction) => void;
    preloadTransactions: (continuation: nt.TransactionId) => Promise<void>;
}

type Item = nt.Transaction | StoredBriefMessageInfo

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
        model.transactions = transactions
        model.preloadTransactions = preloadTransactions
    }, [transactions, preloadTransactions])
    const ref = useRef<GroupedVirtuosoHandle>(null)
    const location = useLocation()
    const navigate = useNavigate()

    const data = useMemo(
        () => ((pendingTransactions ?? []) as Item[]).concat(
            transactions.filter((transaction) => !isConfirmTransaction(transaction)),
        ),
        [pendingTransactions, transactions],
    )
    const groups = useMemo(() => {
        const groups: Array<{ date: string, items: Item[] }> = []
        for (const item of data) {
            let group = groups.at(-1)
            const date = dateFormat.format(item.createdAt * 1000)

            if (!group || group.date !== date) {
                group = { date, items: [] }
                groups.push(group)
            }

            group.items.push(item)
        }
        return groups
    }, [data])

    const handleViewTransaction = (tx: nt.Transaction) => {
        ref.current?.getState((state) => {
            navigate('.', { state, replace: true, preventScrollReset: true })
            onViewTransaction(tx)
        })
    }

    // TODO: elements height optimization
    return (
        <div className={styles.list}>
            <GroupedVirtuoso
                ref={ref}
                customScrollParent={document.body}
                restoreStateFrom={location.state ?? undefined}
                components={{ Item, EmptyPlaceholder }}
                endReached={vm.tryPreloadTransactions}
                computeItemKey={(index: number) => {
                    const item = data.at(index)
                    if (!item) return index
                    return isTransaction(item) ? item.id.hash : item.messageHash
                }}
                groupCounts={groups.map(({ items }) => items.length)}
                groupContent={(index: number) => (
                    <div className={styles.group}>{groups[index].date}</div>
                )}
                itemContent={(index: number) => {
                    const item = data[index]
                    return isTransaction(item) ? (
                        <Transaction
                            key={item.id.hash}
                            symbol={symbol}
                            transaction={item}
                            onViewTransaction={handleViewTransaction}
                        />
                    ) : (
                        <Message
                            everWalletAsset={everWalletAsset}
                            key={item.messageHash}
                            message={item}
                            nativeCurrency={vm.nativeCurrency}
                        />
                    )
                }}
            />
        </div>
    )
})

function isTransaction(value: any): value is nt.Transaction {
    return 'id' in value
}

const dateFormat = new Intl.DateTimeFormat('default', {
    month: 'long',
    day: 'numeric',
})

const Item: Components['Item'] = forwardRef((props, ref: any) => (
    <div className={styles.item} {...props} ref={ref} />
))
