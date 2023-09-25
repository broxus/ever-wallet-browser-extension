import { createMemoryRouter, Navigate, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'
import { DeployWallet } from '@app/popup/modules/deploy'
import { NftCollections } from '@app/popup/modules/nft'

import { Dashboard } from '../Dashboard'
import { AssetFull } from '../AssetFull'
import { TransactionInfo } from '../TransactionInfo'
import { AssetList } from '../UserAssets'
import { Settings } from '../Settings'
import { LanguageSelector } from '../LanguageSelector'
import { ActivityTab } from '../ActivityTab'

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
                    { path: 'activity', element: <ActivityTab /> },
                ],
            },
            { path: 'asset/:root?', element: <AssetFull /> },
            { path: 'transactions/:hash', element: <TransactionInfo /> },
            { path: 'deploy/:address', element: <DeployWallet /> },

            { path: 'settings', element: <Settings /> },
            { path: 'settings/language', element: <LanguageSelector /> },
        ],
    },
])

export function MainPage() {
    return (
        <RouterProvider router={router} />
    )
}
