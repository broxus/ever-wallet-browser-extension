import { observer } from 'mobx-react-lite'
import React from 'react'

import { AccountsManager, CreateAccount } from '@app/popup/modules/account'
import { DeployWallet } from '@app/popup/modules/deploy'
import {
    Panel, SlidingPanel, useDrawerPanel, useViewModel,
} from '@app/popup/modules/shared'
import { isSubmitTransaction } from '@app/shared'

import { AccountDetails } from '../AccountDetails'
import { AssetFull } from '../AssetFull'
import { MultisigTransaction } from '../MultisigTransaction'
import { Receive } from '../Receive'
import { ScrollArea } from '../ScrollArea'
import { TransactionInfo } from '../TransactionInfo'
import { UserAssets } from '../UserAssets'
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
                    onViewTransaction={vm.showTransaction}
                    onViewAsset={vm.showAsset}
                />
            </ScrollArea>

            <SlidingPanel active={drawer.currentPanel !== undefined} onClose={vm.closePanel}>
                {drawer.currentPanel === Panel.RECEIVE && (
                    <Receive accountName={vm.selectedAccount.name} address={vm.selectedAccount.tonWallet.address} />
                )}
                {drawer.currentPanel === Panel.ACCOUNTS_MANAGER && <AccountsManager />}
                {drawer.currentPanel === Panel.DEPLOY && <DeployWallet />}
                {drawer.currentPanel === Panel.CREATE_ACCOUNT && <CreateAccount />}
                {drawer.currentPanel === Panel.ASSET && vm.selectedAsset && (
                    <AssetFull selectedAsset={vm.selectedAsset} />
                )}
                {drawer.currentPanel === Panel.TRANSACTION && vm.selectedTransaction
                    && (isSubmitTransaction(vm.selectedTransaction) ? (
                        <MultisigTransaction
                            transaction={vm.selectedTransaction} onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ) : (
                        <TransactionInfo
                            transaction={vm.selectedTransaction} onOpenInExplorer={vm.openTransactionInExplorer}
                        />
                    ))}
            </SlidingPanel>
        </>
    )
})
