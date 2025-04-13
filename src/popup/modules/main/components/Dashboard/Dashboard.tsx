import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { getClassNameByNetwork, useViewModel } from '@app/popup/modules/shared'
import { NftNotificationContainer } from '@app/popup/modules/nft'
import { ContactsNotificationContainer } from '@app/popup/modules/contacts'
import { DashboardHeader } from '@app/popup/modules/main/components/Dashboard/Header'
import { DashboardBalance } from '@app/popup/modules/main/components/Dashboard/Balance/Balance'
import { DashboardButtons } from '@app/popup/modules/main/components/Dashboard/Buttons'
import { Page } from '@app/popup/modules/shared/components/Page'
import { usePage } from '@app/popup/modules/shared/hooks/usePage'
import { NetworksViewModel } from '@app/popup/modules/network/components/Networks/NetworksViewModel'

import { WalletV5R1Banner } from './Header/WalletV5R1Banner/WalletV5R1Banner'
import { UserAssets } from '../UserAssets'
import { ConnectionError } from '../ConnectionError'
import { DashboardViewModel } from './DashboardViewModel'
import styles from './Dashboard.module.scss'

export const Dashboard = observer((): JSX.Element | null => {
    const intl = useIntl()
    const vm = useViewModel(DashboardViewModel)
    const network = useViewModel(NetworksViewModel)
    const page = usePage()

    useEffect(() => {
        if (vm.showConnectionError) {
            vm.panel.open({
                whiteBg: true,
                showClose: false,
                closeOnBackdropClick: false,
                render: () => <ConnectionError />,
                title: intl.formatMessage({
                    id: 'CONNECTION_ERROR_HEADER',
                }),
            })
        }
    }, [vm.showConnectionError])

    return (
        <Page page={page}>
            <div
                className={classNames(
                    styles.account,
                    styles[`account-${getClassNameByNetwork(network.selectedConnection.connectionId)}`],
                )}
            >
                <DashboardHeader />
                <DashboardBalance />
                <DashboardButtons />
                <UserAssets />
            </div>

            <NftNotificationContainer />
            <ContactsNotificationContainer />
            <WalletV5R1Banner />
        </Page>
    )
})
