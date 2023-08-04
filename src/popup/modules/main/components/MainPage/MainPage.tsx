import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { DrawerPanelProvider, RouterProvider } from '@app/popup/modules/shared'
import { DeployWallet } from '@app/popup/modules/deploy'

import { Dashboard } from '../Dashboard'
import { ManageAssets } from '../ManageAssets'
import { AssetFull } from '../AssetFull'
import { TransactionInfo } from '../TransactionInfo'

const router = createMemoryRouter([
    {
        path: '/',
        element: (
            <>
                <Outlet />
                <ScrollRestoration />
            </>
        ),
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'assets', element: <ManageAssets /> },
            { path: 'asset/:root?', element: <AssetFull /> },
            { path: 'transactions/:hash', element: <TransactionInfo /> },
            { path: 'deploy/:address', element: <DeployWallet /> },
        ],
    },
])

export function MainPage() {
    // TODO: remove DrawerPanelProvider
    return (
        <DrawerPanelProvider key="mainPage">
            <RouterProvider router={router} />
        </DrawerPanelProvider>
    )
}
