import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { useViewModel } from '@app/popup/modules/shared'
import { NftNotificationContainer } from '@app/popup/modules/nft'
import { ContactsNotificationContainer } from '@app/popup/modules/contacts'
import { DashboardHeader } from '@app/popup/modules/main/components/Dashboard/Header'
import { DashboardBalance } from '@app/popup/modules/main/components/Dashboard/Balance'
import { DashboardButtons } from '@app/popup/modules/main/components/Dashboard/Buttons'
import { Page } from '@app/popup/modules/shared/components/Page'
import { usePage } from '@app/popup/modules/shared/hooks/usePage'

import { UserAssets } from '../UserAssets'
import { ConnectionError } from '../ConnectionError'
import { DashboardViewModel } from './DashboardViewModel'
import styles from './Dashboard.module.scss'

export const Dashboard = observer((): JSX.Element | null => {
    const vm = useViewModel(DashboardViewModel)
    const page = usePage()

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
        <Page page={page}>
            {/* <AccountDetails /> */}
            <div className={styles.account}>
                <DashboardHeader />
                <DashboardBalance />
                <DashboardButtons />
                <UserAssets />
            </div>

            <NftNotificationContainer />
            <ContactsNotificationContainer />
        </Page>
    )
})
