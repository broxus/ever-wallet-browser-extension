import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { TransactionList } from '../TransactionList'
import { ActivityTabViewModel } from './ActivityTabViewModel'
import styles from './ActivityTab.module.scss'

export const ActivityTab = observer(() => {
    const vm = useViewModel(ActivityTabViewModel)

    return (
        <div className={styles.container}>
            <TransactionList
                everWalletAsset={vm.everWalletAsset}
                transactions={vm.transactions}
                pendingTransactions={vm.pendingTransactions}
                preloadTransactions={vm.preloadTransactions}
                onViewTransaction={vm.showTransaction}
            />
        </div>
    )
})
