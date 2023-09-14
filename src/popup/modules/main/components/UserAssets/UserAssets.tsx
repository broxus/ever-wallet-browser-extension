import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Outlet, PathMatch, useMatch, useNavigate } from 'react-router'

import { Badge, Tabs, useViewModel } from '@app/popup/modules/shared'

import { UserAssetsViewModel } from './UserAssetsViewModel'
import styles from './UserAssets.module.scss'

export const UserAssets = observer((): JSX.Element => {
    const vm = useViewModel(UserAssetsViewModel)
    const intl = useIntl()
    const navigate = useNavigate()
    const { params: { tab }} = useMatch('/dashboard/:tab') as PathMatch<'tab'>

    const handleChange = useCallback(
        (tab: string) => navigate(tab, { replace: true, preventScrollReset: true }),
        [navigate],
    )

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <Tabs tab={tab} onChange={handleChange}>
                    <Tabs.Tab id="assets">
                        {intl.formatMessage({ id: 'USER_ASSETS_TAB_TOKENS_LABEL' })}
                        {vm.hasUnconfirmedTransactions && (
                            <Badge type="error" />
                        )}
                    </Tabs.Tab>
                    <Tabs.Tab id="activity">
                        {intl.formatMessage({ id: 'USER_ASSETS_TAB_ACTIVITY_LABEL' })}
                    </Tabs.Tab>
                    <Tabs.Tab id="nft">
                        {intl.formatMessage({ id: 'USER_ASSETS_TAB_NFT_LABEL' })}
                        {vm.pendingNftCount > 0 && (
                            <Badge type="info">{vm.pendingNftCount}</Badge>
                        )}
                    </Tabs.Tab>
                </Tabs>
            </div>

            <Outlet />
        </div>
    )
})
