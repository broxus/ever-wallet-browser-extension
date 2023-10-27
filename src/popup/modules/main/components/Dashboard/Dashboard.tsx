import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { useViewModel } from '@app/popup/modules/shared'
import { NftNotificationContainer } from '@app/popup/modules/nft'
import { ContactsNotificationContainer } from '@app/popup/modules/contacts'

import { AccountDetails } from '../AccountDetails'
import { UserAssets } from '../UserAssets'
import { ConnectionError } from '../ConnectionError'
import { DashboardViewModel } from './DashboardViewModel'
import styles from './Dashboard.module.scss'

export const Dashboard = observer((): JSX.Element | null => {
    const vm = useViewModel(DashboardViewModel)

    useEffect(() => {
        if (vm.showConnectionError) {
            vm.panel.open({
                whiteBg: true,
                showClose: false,
                closeOnBackdropClick: false,
                render: () => <ConnectionError />,
            })
        }
    }, [vm.showConnectionError])

    return (
        <>
            <div className={styles.dashboard}>
                <AccountDetails />
                <UserAssets />
            </div>

            <NftNotificationContainer />
            <ContactsNotificationContainer />
        </>
    )
})
