import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { useViewModel } from '@app/popup/modules/shared'
import { NftNotificationContainer } from '@app/popup/modules/nft'
import { ContactsNotificationContainer } from '@app/popup/modules/contacts'

import { AccountDetails } from '../AccountDetails'
import { UserAssets } from '../UserAssets'
import { ConnectionError } from '../ConnectionError'
import { DashboardViewModel } from './DashboardViewModel'

import './Dashboard.scss'

export const Dashboard = observer((): JSX.Element | null => {
    const vm = useViewModel(DashboardViewModel)

    useEffect(() => {
        if (vm.showConnectionError) {
            vm.panel.open({
                showClose: false,
                closeOnBackdropClick: false,
                render: () => <ConnectionError />,
            })
        }
    }, [vm.showConnectionError])

    return (
        <>
            <div className="dashboard">
                <AccountDetails />
                <UserAssets />
            </div>

            {/* <SlidingPanel
                {...vm.drawer.config}
                active={vm.drawer.panel !== undefined}
                onClose={vm.closePanel}
            >
                {vm.drawer.panel === Panel.ACCOUNTS_MANAGER && <AccountsManager />}
                {vm.drawer.panel === Panel.CREATE_ACCOUNT && <CreateAccount />}
                {vm.drawer.panel === Panel.VERIFY_ADDRESS && vm.addressToVerify && (
                    <LedgerVerifyAddress address={vm.addressToVerify} onBack={vm.drawer.close} />
                )}
            </SlidingPanel> */}

            <NftNotificationContainer />
            <ContactsNotificationContainer />
        </>
    )
})
