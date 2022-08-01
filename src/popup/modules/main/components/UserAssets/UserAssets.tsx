import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { SelectedAsset } from '@app/shared'
import { SlidingPanel, Tabs, useViewModel } from '@app/popup/modules/shared'

import { AddNewToken } from './components/AddNewToken'
import { AssetList } from './components/AssetList'
import { TransactionList } from '../TransactionList'
import { Tab, UserAssetsViewModel } from './UserAssetsViewModel'

import './UserAssets.scss'

interface Props {
    onViewTransaction: (transaction: nt.Transaction) => void;
    onViewAsset: (asset: SelectedAsset) => void;
}

export const UserAssets = observer((props: Props): JSX.Element => {
    const {
        onViewTransaction,
        onViewAsset,
    } = props

    const vm = useViewModel(UserAssetsViewModel)
    const intl = useIntl()

    return (
        <div className="user-assets">
            <Tabs className="user-assets__tabs" tab={vm.tab.value} onChange={vm.tab.setValue}>
                <Tabs.Tab id={Tab.Assets}>
                    {intl.formatMessage({ id: 'USER_ASSETS_TAB_ASSETS_LABEL' })}
                </Tabs.Tab>
                <Tabs.Tab id={Tab.Transactions}>
                    {intl.formatMessage({ id: 'USER_ASSETS_TAB_TRANSACTIONS_LABEL' })}
                </Tabs.Tab>
            </Tabs>
            {vm.tab.value === Tab.Assets && (
                <AssetList
                    everWalletAsset={vm.everWalletAsset}
                    tokenWalletAssets={vm.tokenWalletAssets}
                    everWalletState={vm.everWalletState}
                    knownTokens={vm.knownTokens}
                    tokenWalletStates={vm.tokenWalletStates}
                    onSelectAssets={vm.openSelectAssets}
                    onViewAsset={onViewAsset}
                />
            )}
            {vm.tab.value === Tab.Transactions && (
                <TransactionList
                    everWalletAsset={vm.everWalletAsset}
                    topOffset={397 + 54}
                    fullHeight={600}
                    transactions={vm.transactions}
                    pendingTransactions={vm.pendingTransactions}
                    preloadTransactions={vm.preloadTransactions}
                    onViewTransaction={onViewTransaction}
                />
            )}

            <SlidingPanel active={vm.selectAssets} onClose={vm.closeSelectAssets}>
                <AddNewToken
                    tokenWallets={vm.tokenWalletAssets}
                    knownTokens={vm.knownTokens}
                    tokensManifest={vm.tokensManifest}
                    tokensMeta={vm.tokensMeta}
                    onSubmit={vm.updateTokenWallets}
                    onBack={vm.closeSelectAssets}
                />
            </SlidingPanel>
        </div>
    )
})
