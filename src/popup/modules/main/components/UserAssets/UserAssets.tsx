import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NftCollection } from '@app/models'
import { SelectedAsset } from '@app/shared'
import { Badge, Tabs, useViewModel } from '@app/popup/modules/shared'
import { NftCollections } from '@app/popup/modules/nft'

import { AssetList } from './components'
import { Tab, UserAssetsViewModel } from './UserAssetsViewModel'

import './UserAssets.scss'

interface Props {
    onViewAsset(asset: SelectedAsset): void;
    onViewNftCollection(collection: NftCollection): void;
    onImportNft(): void;
}

export const UserAssets = observer(({ onViewAsset, onViewNftCollection, onImportNft }: Props): JSX.Element => {
    const vm = useViewModel(UserAssetsViewModel)
    const intl = useIntl()

    return (
        <div className="user-assets">
            <Tabs className="user-assets__tabs" tab={vm.tab.value} onChange={vm.tab.setValue}>
                <Tabs.Tab id={Tab.Tokens}>
                    {intl.formatMessage({ id: 'USER_ASSETS_TAB_TOKENS_LABEL' })}
                    {vm.hasUnconfirmedTransactions && (
                        <Badge type="error" />
                    )}
                </Tabs.Tab>
                <Tabs.Tab id={Tab.Nft}>
                    {intl.formatMessage({ id: 'USER_ASSETS_TAB_NFT_LABEL' })}
                    {vm.pendingNftCount > 0 && (
                        <Badge type="info">{vm.pendingNftCount}</Badge>
                    )}
                </Tabs.Tab>
            </Tabs>
            {vm.tab.is(Tab.Tokens) && (
                <AssetList onViewAsset={onViewAsset} />
            )}
            {vm.tab.is(Tab.Nft) && (
                <NftCollections onViewNftCollection={onViewNftCollection} onImportNft={onImportNft} />
            )}
        </div>
    )
})
