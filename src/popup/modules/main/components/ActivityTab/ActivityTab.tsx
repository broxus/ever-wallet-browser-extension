import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

import { useViewModel } from '@app/popup/modules/shared'

import { TransactionList } from '../TransactionList'
import { TransactionInfo } from '../TransactionInfo'
import { ActivityTabViewModel } from './ActivityTabViewModel'
import styles from './ActivityTab.module.scss'

export const ActivityTab = observer(() => {
    const vm = useViewModel(ActivityTabViewModel)

    const handleViewTransaction = useCallback((transaction: nt.Transaction) => vm.panel.open({
        render: () => <TransactionInfo asset={vm.asset} hash={transaction.id.hash} />,
    }), [])

    return (
        <div className={styles.container}>
            <TransactionList
                everWalletAsset={vm.everWalletAsset}
                transactions={vm.transactions}
                pendingTransactions={vm.pendingTransactions}
                preloadTransactions={vm.preloadTransactions}
                onViewTransaction={handleViewTransaction}
            />
        </div>
    )
})
