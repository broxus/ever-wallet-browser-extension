import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Outlet, useNavigate } from 'react-router'
import { useCallback } from 'react'

import { useViewModel } from '@app/popup/modules/shared'
import { isTokenSymbol } from '@app/shared'

import { ManageAssets } from '../../../ManageAssets'
import { RefreshAssets } from '../../../RefreshAssets'
import { AssetListItem } from '../AssetListItem'
import { AssetListViewModel } from './AssetListViewModel'
import styles from './AssetList.module.scss'

export const AssetList = observer((): JSX.Element | null => {
    const vm = useViewModel(AssetListViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    const handleManageAssets = useCallback(() => vm.panel.open({
        showClose: false,
        whiteBg: true,
        render: () => <ManageAssets />,
    }), [])

    const handleRefreshAssets = useCallback(() => vm.panel.open({
        showClose: false,
        whiteBg: true,
        render: () => <RefreshAssets />,
    }), [])

    if (!vm.everWalletAsset) return null

    return (
        <>
            <div className={styles.assetsList} role="menu">
                <AssetListItem
                    type="ever_wallet"
                    address={vm.everWalletAsset.address}
                    balance={vm.everWalletState?.balance}
                    currencySymbol={vm.nativeCurrency}
                    decimals={9}
                    badge={vm.hasUnconfirmedTransactions}
                    onClick={() => navigate('/dashboard/assets/native')}
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
                            currencySymbol={token?.symbol ?? symbol?.name}
                            decimals={token?.decimals ?? symbol?.decimals}
                            old={isTokenSymbol(symbol) && symbol?.version === 'OldTip3v4'}
                            onClick={() => navigate(`/dashboard/assets/${rootTokenContract}`)}
                        />
                    )
                })}
            </div>

            <div className={styles.footer}>
                {!!vm.newTokensLength && (
                    <div>
                        <button type="button" className={styles.btn} onClick={handleRefreshAssets}>
                            {intl.formatMessage(
                                { id: 'NEW_TOKENS_PLURAL' },
                                { count: vm.newTokensLength },
                            )}
                        </button>
                        &nbsp;
                        {intl.formatMessage({ id: 'FOUND_IN_THIS_ACCOUNT' })}
                        &nbsp;
                    </div>
                )}
                <div>
                    {intl.formatMessage({
                        id: 'TOKEN_MANAGEMENT_TITLE',
                    })}
                </div>
                <div>
                    {vm.manifest && (
                        <>
                            <button type="button" className={styles.btn} onClick={handleRefreshAssets}>
                                {intl.formatMessage({ id: 'REFRESH_ASSETS_BTN_TEXT' })}
                            </button>
                            &nbsp;
                            {intl.formatMessage({ id: 'OR' })}
                            &nbsp;
                        </>
                    )}
                    <button type="button" className={styles.btn} onClick={handleManageAssets}>
                        {intl.formatMessage({ id: 'SELECT_ASSETS_BTN_TEXT' })}
                    </button>
                </div>
            </div>

            <Outlet />
        </>
    )
})
