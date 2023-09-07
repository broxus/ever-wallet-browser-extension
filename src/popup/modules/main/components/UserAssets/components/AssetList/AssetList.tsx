import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Icons } from '@app/popup/icons'
import { useViewModel } from '@app/popup/modules/shared'

import { AssetListItem } from '../AssetListItem'
import { AssetListViewModel } from './AssetListViewModel'
import styles from './AssetList.module.scss'

export const AssetList = observer((): JSX.Element | null => {
    const vm = useViewModel(AssetListViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    if (!vm.everWalletAsset) return null

    return (
        <div className={styles.assetsList} role="menu">
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

            <div className={styles.buttons}>
                <button type="button" className={styles.btn} onClick={() => console.log('TODO')}>
                    {intl.formatMessage({ id: 'REFRESH_ASSETS_BTN_TEXT' })}
                    {Icons.refresh}
                </button>
                <button type="button" className={styles.btn} onClick={() => navigate('/assets')}>
                    {intl.formatMessage({ id: 'SELECT_ASSETS_BTN_TEXT' })}
                    {Icons.settings}
                </button>
            </div>
        </div>
    )
})
