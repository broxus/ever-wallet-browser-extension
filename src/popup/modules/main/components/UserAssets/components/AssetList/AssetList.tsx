import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, useViewModel } from '@app/popup/modules/shared'

import { AssetListItem } from '../AssetListItem'
import { AssetListViewModel } from './AssetListViewModel'
import './AssetList.scss'

export const AssetList = observer((): JSX.Element | null => {
    const vm = useViewModel(AssetListViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    if (!vm.everWalletAsset) return null

    return (
        <div className="assets-list" role="menu">
            <AssetListItem
                type="ever_wallet"
                address={vm.everWalletAsset.address}
                balance={vm.everWalletState?.balance}
                currencyName={vm.nativeCurrency}
                decimals={9}
                badge={vm.hasUnconfirmedTransactions}
                onClick={() => navigate('/asset')}
            />
            {vm.tokenWalletAssets.map(({ rootTokenContract }) => {
                const symbol = vm.knownTokens[rootTokenContract]
                const token = vm.tokens[rootTokenContract]
                const balance = vm.tokenWalletStates[rootTokenContract]?.balance

                return (
                    <AssetListItem
                        type="token_wallet"
                        key={rootTokenContract}
                        address={rootTokenContract}
                        balance={balance}
                        currencyName={token?.symbol ?? symbol?.name}
                        decimals={symbol?.decimals}
                        old={symbol?.version !== 'Tip3'}
                        onClick={() => navigate(`/asset/${rootTokenContract}`)}
                    />
                )
            })}

            <Button onClick={() => navigate('/assets')}>
                {intl.formatMessage({ id: 'SELECT_ASSETS_BTN_TEXT' })}
            </Button>
        </div>
    )
})
