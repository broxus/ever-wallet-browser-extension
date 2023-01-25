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

import './styles/app.scss'

const WelcomePage = lazy(() => import('@app/popup/modules/onboarding'))

// TODO: lazy
function App(): JSX.Element | null {
    const accountability = useResolve(AccountabilityStore)
    const config = useResolve(AppConfig)

    const hasAccount = Object.keys(accountability.accountEntries).length > 0
    const isFullscreen = config.activeTab?.type === 'fullscreen'
    const isNotification = config.activeTab?.type === 'notification'

    if (isFullscreen) {
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

    if (isNotification && config.windowInfo.group === 'ask_iframe') {
        return <LedgerConnectorPage key="ledgerConnectorPage" />
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

    return (
        <DrawerPanelProvider key="mainPage">
            <MainPage />
        </DrawerPanelProvider>
    )
}

export default observer(App)
