import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { Components, GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import { StoredBriefMessageInfo } from '@app/models'
import { isConfirmTransaction } from '@app/shared'
import { useViewModel } from '@app/popup/modules/shared'

import { EmptyPlaceholder, Message, Scroller, Transaction } from './components'
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

    const [page, setPage] = useState<HTMLElement | null>(null)

    const vm = useViewModel(TransactionListViewModel, model => {
        model.transactions = transactions
        model.preloadTransactions = preloadTransactions
    }, [transactions, preloadTransactions])
    const ref = useRef<GroupedVirtuosoHandle>(null)
    const intl = useIntl()

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
            const date = intl.formatDate(item.createdAt * 1000, {
                month: 'long',
                day: 'numeric',
            })

            if (!group || group.date !== date) {
                group = { date, items: [] }
                groups.push(group)
            }

            group.items.push(item)
        }
        return groups
    }, [data])

    const handleViewTransaction = (tx: nt.Transaction) => {
        onViewTransaction(tx)
    }

    useEffect(() => {
        setPage(document.getElementById('asset-page'))
    }, [])

    if (!page) {
        return null
    }

    // TODO: elements height optimization
    return (
        <div className={styles.list}>
            <GroupedVirtuoso
                ref={ref}
                customScrollParent={page}
                components={{ Item, EmptyPlaceholder, Scroller }}
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
                itemContent={(index: number, groupIndex: number) => {
                    const item = data[index]
                    const first = groups[groupIndex].items.at(0) === item
                    const last = groups[groupIndex].items.at(-1) === item

                    return isTransaction(item) ? (
                        <Transaction
                            first={first}
                            last={last}
                            key={item.id.hash}
                            symbol={symbol}
                            transaction={item}
                            onViewTransaction={handleViewTransaction}
                        />
                    ) : (
                        <Message
                            first={first}
                            last={last}
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

const Item: Components['Item'] = forwardRef((props, ref: any) => (
    <div {...props} ref={ref} />
))
