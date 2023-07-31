import { observer } from 'mobx-react-lite'

import { AccountsManager, CreateAccount } from '@app/popup/modules/account'
import { DeployWallet } from '@app/popup/modules/deploy'
import { Panel, SlidingPanel, useViewModel } from '@app/popup/modules/shared'
import { NftImport, NftList, NftNotificationContainer } from '@app/popup/modules/nft'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'
import { ContactsNotificationContainer } from '@app/popup/modules/contacts'

import { AccountDetails } from '../AccountDetails'
import { UserAssets } from '../UserAssets'
import { ConnectionError } from '../ConnectionError'
import { LanguageSelector } from '../LanguageSelector'
import { DashboardViewModel } from './DashboardViewModel'

import './Dashboard.scss'

export const Dashboard = observer((): JSX.Element | null => {
    const vm = useViewModel(DashboardViewModel)

    return (
        <>
            <div className="dashboard">
                <AccountDetails
                    onVerifyAddress={vm.verifyAddress}
                    onNetworkSettings={vm.openNetworkSettings}
                />
                <UserAssets
                    onViewNftCollection={vm.showNftCollection}
                    onImportNft={vm.showNftImport}
                />
            </div>

            <SlidingPanel
                {...vm.drawer.config}
                active={vm.drawer.panel !== undefined}
                onClose={vm.closePanel}
            >
                {vm.drawer.panel === Panel.ACCOUNTS_MANAGER && <AccountsManager />}
                {vm.drawer.panel === Panel.DEPLOY && <DeployWallet />}
                {vm.drawer.panel === Panel.CREATE_ACCOUNT && <CreateAccount />}
                {vm.drawer.panel === Panel.NFT_COLLECTION && vm.selectedNftCollection && (
                    <NftList collection={vm.selectedNftCollection} />
                )}
                {vm.drawer.panel === Panel.NFT_IMPORT && <NftImport />}
                {vm.drawer.panel === Panel.CONNECTION_ERROR && vm.availableConnections.length && (
                    <ConnectionError
                        availableConnections={vm.availableConnections}
                        onChangeNetwork={vm.changeNetwork}
                        onNetworkSettings={vm.openNetworkSettings}
                    />
                )}
                {vm.drawer.panel === Panel.VERIFY_ADDRESS && vm.addressToVerify && (
                    <LedgerVerifyAddress address={vm.addressToVerify} onBack={vm.drawer.close} />
                )}
                {vm.drawer.panel === Panel.LANGUAGE && (
                    <LanguageSelector onBack={vm.drawer.close} />
                )}
            </SlidingPanel>

            <NftNotificationContainer />
            <ContactsNotificationContainer />
        </>
    )
})
