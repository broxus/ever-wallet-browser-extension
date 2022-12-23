import { observer } from 'mobx-react-lite'

import { AccountsManager, CreateAccount } from '@app/popup/modules/account'
import { DeployWallet } from '@app/popup/modules/deploy'
import {
    Panel,
    SlidingPanel,
    useDrawerPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import { isSubmitTransaction, supportedByLedger } from '@app/shared'
import { NftList, NftImport, NftNotificationContainer } from '@app/popup/modules/nft'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'

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
                <AccountDetails
                    onVerifyAddress={vm.verifyAddress}
                />
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
                    <Receive
                        account={vm.selectedAccount}
                        canVerifyAddress={vm.selectedKey.signerName === 'ledger_key' && supportedByLedger(vm.selectedAccount.tonWallet.contractType)}
                        onVerifyAddress={vm.verifyAddress}
                    />
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
                {drawer.panel === Panel.VERIFY_ADDRESS && vm.addressToVerify && (
                    <LedgerVerifyAddress address={vm.addressToVerify} onBack={drawer.close} />
                )}
            </SlidingPanel>

            <NftNotificationContainer />
        </>
    )
})
