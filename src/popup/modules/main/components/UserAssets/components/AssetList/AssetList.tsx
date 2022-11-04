import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NATIVE_CURRENCY, SelectedAsset } from '@app/shared'
import { Button, SlidingPanel, useViewModel } from '@app/popup/modules/shared'

import { AddNewToken } from '../AddNewToken'
import { AssetListItem } from '../AssetListItem'
import { AssetListViewModel } from './AssetListViewModel'

import './AssetList.scss'

interface Props {
    onViewAsset: (asset: SelectedAsset) => void;
}

export const AssetList = observer(({ onViewAsset }: Props): JSX.Element => {
    const vm = useViewModel(AssetListViewModel)
    const intl = useIntl()

    const handleClick = () => {
        onViewAsset({
            type: 'ever_wallet',
            data: {
                address: vm.everWalletAsset.address,
            },
        })
    }

    return (
        <>
            <div className="assets-list" role="menu">
                <AssetListItem
                    type="ever_wallet"
                    address={vm.everWalletAsset.address}
                    balance={vm.everWalletState?.balance}
                    name={NATIVE_CURRENCY}
                    decimals={9}
                    onClick={handleClick}
                />
                {vm.tokenWalletAssets.map(({ rootTokenContract }) => {
                    const symbol = vm.knownTokens[rootTokenContract]
                    const balance = vm.tokenWalletStates[rootTokenContract]?.balance
                    const handleClick = () => {
                        onViewAsset({
                            type: 'token_wallet',
                            data: {
                                owner: vm.everWalletAsset.address,
                                rootTokenContract,
                            },
                        })
                    }

                    return (
                        <AssetListItem
                            type="token_wallet"
                            key={rootTokenContract}
                            address={rootTokenContract}
                            balance={balance}
                            name={symbol?.name}
                            decimals={symbol?.decimals}
                            old={symbol?.version !== 'Tip3'}
                            onClick={handleClick}
                        />
                    )
                })}

                <Button design="secondary" className="assets-list__btn" onClick={vm.openSelectAssets}>
                    {intl.formatMessage({ id: 'SELECT_ASSETS_BTN_TEXT' })}
                </Button>
            </div>

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
        </>
    )
})
