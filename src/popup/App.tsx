import { lazy } from 'react'
import { observer } from 'mobx-react-lite'

import { AccountsManagerPage } from '@app/popup/modules/account'
import { ApprovalPage } from '@app/popup/modules/approvals'
import { DeployMultisigWallet } from '@app/popup/modules/deploy'
import { MainPage } from '@app/popup/modules/main'
import { SendPage } from '@app/popup/modules/send'
import { AccountabilityStore, AppConfig, DrawerPanelProvider, useResolve } from '@app/popup/modules/shared'
import { LedgerConnectorPage } from '@app/popup/modules/ledger'
import { StakePage } from '@app/popup/modules/stake'
import { TransferNftPage } from '@app/popup/modules/nft'
import { NetworkSettingsPage } from '@app/popup/modules/network'
import { ContactsPage } from '@app/popup/modules/contacts'

const WelcomePage = lazy(() => import('@app/popup/modules/onboarding'))

// TODO: lazy
function App(): JSX.Element | null {
    const accountability = useResolve(AccountabilityStore)
    const config = useResolve(AppConfig)

    const hasAccount = Object.keys(accountability.accountEntries).length > 0
    const isFullscreen = config.activeTab?.type === 'fullscreen'
    const isNotification = config.activeTab?.type === 'notification'

    if (isFullscreen) {
        if (location.hash === '#ledger') {
            return <LedgerConnectorPage key="ledgerConnectorPage" />
        }

        return <WelcomePage key="welcomePage" />
    }

    if (hasAccount && !accountability.selectedAccount) {
        return null
    }

    if (config.windowInfo.group === 'approval') {
        return <ApprovalPage key="approvalPage" />
    }

    if (isNotification && config.windowInfo.group === 'deploy_multisig_wallet') {
        return <DeployMultisigWallet key="deployMultisigWallet" />
    }

    if (isNotification && config.windowInfo.group === 'send') {
        return <SendPage key="sendPage" />
    }

    if (isNotification && config.windowInfo.group === 'manage_seeds') {
        return <AccountsManagerPage key="accountsManagerPage" />
    }

    if (isNotification && config.windowInfo.group === 'stake') {
        return (
            <DrawerPanelProvider key="stakePage">
                <StakePage />
            </DrawerPanelProvider>
        )
    }

    if (isNotification && config.windowInfo.group === 'transfer_nft') {
        return <TransferNftPage key="transferNftPage" />
    }

    if (isNotification && config.windowInfo.group === 'network_settings') {
        return <NetworkSettingsPage key="networkSettingsPage" />
    }

    if (isNotification && config.windowInfo.group === 'contacts') {
        return <ContactsPage key="contactsPage" />
    }

    return (
        <DrawerPanelProvider key="mainPage">
            <MainPage />
        </DrawerPanelProvider>
    )
}

export default observer(App)
