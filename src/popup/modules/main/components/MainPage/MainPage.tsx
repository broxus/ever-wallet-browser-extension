import { observer } from 'mobx-react-lite'

import { AccountsManager, CreateAccount } from '@app/popup/modules/account'
import { DeployWallet } from '@app/popup/modules/deploy'
import { Panel, SlidingPanel, useViewModel } from '@app/popup/modules/shared'
import { isSubmitTransaction, supportedByLedger } from '@app/shared'
import { NftImport, NftList, NftNotificationContainer } from '@app/popup/modules/nft'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'
import { NetworkSettingsPage } from '@app/popup/modules/network'

import { AccountDetails } from '../AccountDetails'
import { AssetFull } from '../AssetFull'
import { MultisigTransaction } from '../MultisigTransaction'
import { Receive } from '../Receive'
import { ScrollArea } from '../ScrollArea'
import { TransactionInfo } from '../TransactionInfo'
import { UserAssets } from '../UserAssets'
import { ConnectionError } from '../ConnectionError'
import { MainPageViewModel } from './MainPageViewModel'

import './MainPage.scss'

export const MainPage = observer((): JSX.Element | null => {
    const vm = useViewModel(MainPageViewModel)

    return (
        <>
            <ScrollArea className="main-page">
                <AccountDetails
                    onVerifyAddress={vm.verifyAddress}
                    onNetworkSettings={vm.openNetworkSettings}
                />
                <UserAssets
                    onViewAsset={vm.showAsset}
                    onViewNftCollection={vm.showNftCollection}
                    onImportNft={vm.showNftImport}
                />
            </ScrollArea>

            <SlidingPanel
                {...vm.drawer.config}
                active={vm.drawer.panel !== undefined}
                onClose={vm.closePanel}
            >
                {vm.drawer.panel === Panel.RECEIVE && (
                    <Receive
                        account={vm.selectedAccount}
                        canVerifyAddress={vm.selectedKey.signerName === 'ledger_key' && supportedByLedger(vm.selectedAccount.tonWallet.contractType)}
                        onVerifyAddress={vm.verifyAddress}
                    />
                )}
                {vm.drawer.panel === Panel.ACCOUNTS_MANAGER && <AccountsManager />}
                {vm.drawer.panel === Panel.DEPLOY && <DeployWallet />}
                {vm.drawer.panel === Panel.CREATE_ACCOUNT && <CreateAccount />}
                {vm.drawer.panel === Panel.ASSET && vm.selectedAsset && (
                    <AssetFull selectedAsset={vm.selectedAsset} />
                )}
                {vm.drawer.panel === Panel.NFT_COLLECTION && vm.selectedNftCollection && (
                    <NftList collection={vm.selectedNftCollection} />
                )}
                {vm.drawer.panel === Panel.NFT_IMPORT && <NftImport />}
                {vm.drawer.panel === Panel.TRANSACTION && vm.selectedTransaction
                    && (isSubmitTransaction(vm.selectedTransaction) ? (
                        <MultisigTransaction
                            transaction={vm.selectedTransaction}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ) : (
                        <TransactionInfo
                            transaction={vm.selectedTransaction}
                            nativeCurrency={vm.nativeCurrency}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ))}
                {vm.drawer.panel === Panel.CONNECTION_ERROR && vm.availableConnections.length && (
                    <ConnectionError
                        availableConnections={vm.availableConnections}
                        onChangeNetwork={vm.changeNetwork}
                    />
                )}
                {vm.drawer.panel === Panel.VERIFY_ADDRESS && vm.addressToVerify && (
                    <LedgerVerifyAddress address={vm.addressToVerify} onBack={vm.drawer.close} />
                )}

                {vm.drawer.panel === Panel.NETWORK_SETTINGS && (
                    <NetworkSettingsPage />
                )}
            </SlidingPanel>

            <NftNotificationContainer />
        </>
    )
})
