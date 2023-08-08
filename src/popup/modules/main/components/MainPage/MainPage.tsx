import { createMemoryRouter, Navigate, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { DrawerPanelProvider, RouterProvider } from '@app/popup/modules/shared'
import { DeployWallet } from '@app/popup/modules/deploy'
import { NftCollectionInfo, NftCollections, NftDetails, NftImport } from '@app/popup/modules/nft'

import { Dashboard } from '../Dashboard'
import { ManageAssets } from '../ManageAssets'
import { AssetFull } from '../AssetFull'
import { TransactionInfo } from '../TransactionInfo'
import { AssetList } from '../UserAssets'
import { Settings } from '../Settings'

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
            { index: true, element: <Navigate to="/dashboard/assets" replace /> },

            {
                path: 'dashboard',
                element: <Dashboard />,
                children: [
                    { path: 'assets', element: <AssetList /> },
                    { path: 'nft', element: <NftCollections /> },
                ],
            },
            { path: 'assets', element: <ManageAssets /> },
            { path: 'asset/:root?', element: <AssetFull /> },
            { path: 'transactions/:hash', element: <TransactionInfo /> },
            { path: 'deploy/:address', element: <DeployWallet /> },

            { path: 'nft/import', element: <NftImport /> },
            { path: 'nft/collection/:address', element: <NftCollectionInfo /> },
            { path: 'nft/details/:address', element: <NftDetails /> },

            { path: 'settings', element: <Settings /> },
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
