import { observer } from 'mobx-react-lite'

import { AccountsManager, CreateAccount } from '@app/popup/modules/account'
import { DeployWallet } from '@app/popup/modules/deploy'
import {
    Panel,
    SlidingPanel,
    useDrawerPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import { isSubmitTransaction } from '@app/shared'
import { NftList, NftImport, NftNotificationContainer } from '@app/popup/modules/nft'

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
    const drawer = useDrawerPanel()
    const vm = useViewModel(MainPageViewModel, model => {
        model.drawer = drawer
    })

    return (
        <>
            <ScrollArea className="main-page">
                <AccountDetails />
                <UserAssets
                    onViewAsset={vm.showAsset}
                    onViewNftCollection={vm.showNftCollection}
                    onImportNft={vm.showNftImport}
                />
            </ScrollArea>

            <SlidingPanel
                {...drawer.config}
                active={drawer.panel !== undefined}
                onClose={vm.closePanel}
            >
                {drawer.panel === Panel.RECEIVE && (
                    <Receive accountName={vm.selectedAccount.name} address={vm.selectedAccount.tonWallet.address} />
                )}
                {drawer.panel === Panel.ACCOUNTS_MANAGER && <AccountsManager />}
                {drawer.panel === Panel.DEPLOY && <DeployWallet />}
                {drawer.panel === Panel.CREATE_ACCOUNT && <CreateAccount />}
                {drawer.panel === Panel.ASSET && vm.selectedAsset && (
                    <AssetFull selectedAsset={vm.selectedAsset} />
                )}
                {drawer.panel === Panel.NFT_COLLECTION && vm.selectedNftCollection && (
                    <NftList collection={vm.selectedNftCollection} />
                )}
                {drawer.panel === Panel.NFT_IMPORT && <NftImport />}
                {drawer.panel === Panel.TRANSACTION && vm.selectedTransaction
                    && (isSubmitTransaction(vm.selectedTransaction) ? (
                        <MultisigTransaction
                            transaction={vm.selectedTransaction}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ) : (
                        <TransactionInfo
                            transaction={vm.selectedTransaction}
                            onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ))}
                {drawer.panel === Panel.CONNECTION_ERROR && vm.availableConnections.length && (
                    <ConnectionError
                        availableConnections={vm.availableConnections}
                        onChangeNetwork={vm.changeNetwork}
                    />
                )}
            </SlidingPanel>

            <NftNotificationContainer />
        </>
    )
})
