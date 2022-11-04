import { observer } from 'mobx-react-lite'

import { AccountsManagerPage } from '@app/popup/modules/account'
import { ApprovalPage } from '@app/popup/modules/approvals'
import { DeployMultisigWallet } from '@app/popup/modules/deploy'
import { MainPage } from '@app/popup/modules/main'
import { SendPage } from '@app/popup/modules/send'
import { AccountabilityStore, AppConfig, DrawerPanelProvider, useResolve } from '@app/popup/modules/shared'
import { WelcomePage } from '@app/popup/modules/welcome'
import { LedgerConnectorPage } from '@app/popup/modules/ledger'
import { StakePage } from '@app/popup/modules/stake'
import { TransferNftPage } from '@app/popup/modules/nft'

import './styles/app.scss'

function App(): JSX.Element | null {
    const accountability = useResolve(AccountabilityStore)
    const config = useResolve(AppConfig)

    const hasAccount = Object.keys(accountability.accountEntries).length > 0
    const isFullscreen = config.activeTab?.type === 'fullscreen'
    const isNotification = config.activeTab?.type === 'notification'

    if (hasAccount && !accountability.selectedAccount) {
        return null
    }

    if (isFullscreen) {
        return <WelcomePage key="welcomePage" />
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

    return (
        <DrawerPanelProvider key="mainPage">
            <MainPage />
        </DrawerPanelProvider>
    )
}

export default observer(App)
