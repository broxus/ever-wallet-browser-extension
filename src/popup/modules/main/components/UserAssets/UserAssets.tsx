import { observer } from 'mobx-react-lite'
import { Outlet } from 'react-router'


// export const UserAssets = observer((): JSX.Element => {
//     const vm = useViewModel(UserAssetsViewModel)
//     const intl = useIntl()
//     const navigate = useNavigate()
//     const {
//         params: { tab },
//     } = useMatch('/dashboard/:tab?/:root?/:hash?') as PathMatch<'tab'>

//     const handleChange = useCallback(
//         (tab: string) => navigate(tab, { replace: true, preventScrollReset: true }),
//         [navigate],
//     )

//     return (
//         <>
//             <Tabs tab={tab} onChange={handleChange} className={styles.tabs}>
//                 <Tabs.Tab id="assets">
//                     {intl.formatMessage({ id: 'USER_ASSETS_TAB_TOKENS_LABEL' })}
//                     {vm.hasUnconfirmedTransactions && (
//                         <Badge type="error" />
//                     )}
//                 </Tabs.Tab>
//                 <Tabs.Tab id="nft">
//                     {intl.formatMessage({ id: 'USER_ASSETS_TAB_NFT_LABEL' })}
//                     {vm.pendingNftCount > 0 && (
//                         <Badge type="info">{vm.pendingNftCount}</Badge>
//                     )}
//                 </Tabs.Tab>
//             </Tabs>

//             <Outlet />
//         </>
//     )
// })


export const UserAssets = observer((): JSX.Element => (
    <Outlet />
))
