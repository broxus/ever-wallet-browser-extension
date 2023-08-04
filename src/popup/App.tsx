import { lazy } from 'react'
import { observer } from 'mobx-react-lite'

import { AccountsManagerPage } from '@app/popup/modules/account'
import { ApprovalPage } from '@app/popup/modules/approvals'
import { DeployMultisigPage } from '@app/popup/modules/deploy'
import { MainPage } from '@app/popup/modules/main'
import { SendPage } from '@app/popup/modules/send'
import { AppConfig, DrawerPanelProvider, useResolve } from '@app/popup/modules/shared'
import { LedgerConnectorPage } from '@app/popup/modules/ledger'
import { StakePage } from '@app/popup/modules/stake'
import { TransferNftPage } from '@app/popup/modules/nft'
import { NetworkSettingsPage } from '@app/popup/modules/network'
import { ContactsPage } from '@app/popup/modules/contacts'

const WelcomePage = lazy(() => import('@app/popup/modules/onboarding'))

function App(): JSX.Element | null {
    const { activeTab, windowInfo } = useResolve(AppConfig)

    const isFullscreen = activeTab?.type === 'fullscreen'
    const isNotification = activeTab?.type === 'notification'

    if (isFullscreen) {
        if (location.hash === '#ledger') {
            return <LedgerConnectorPage key="ledgerConnectorPage" />
        }

        return <WelcomePage key="welcomePage" />
    }

    if (windowInfo.group === 'approval') {
        return <ApprovalPage key="approvalPage" />
    }

    if (isNotification && windowInfo.group === 'deploy_multisig_wallet') {
        return <DeployMultisigPage key="deployMultisigWallet" />
    }

    if (isNotification && windowInfo.group === 'send') {
        return <SendPage key="sendPage" />
    }

    if (isNotification && windowInfo.group === 'manage_seeds') {
        return <AccountsManagerPage key="accountsManagerPage" />
    }

    if (isNotification && windowInfo.group === 'stake') {
        return (
            <DrawerPanelProvider key="stakePage">
                <StakePage />
            </DrawerPanelProvider>
        )
    }

    if (isNotification && (windowInfo.group === 'transfer_nft' || windowInfo.group === 'transfer_nft_token')) {
        return <TransferNftPage key="transferNftPage" />
    }

    if (isNotification && windowInfo.group === 'network_settings') {
        return <NetworkSettingsPage key="networkSettingsPage" />
    }

    if (isNotification && windowInfo.group === 'contacts') {
        return <ContactsPage key="contactsPage" />
    }

    return <MainPage />
}

export default observer(App)
