import { createMemoryRouter, Navigate, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'
import { NftCollections } from '@app/popup/modules/nft'

import { Dashboard } from '../Dashboard'
import { AssetFull } from '../AssetFull'
import { AssetList } from '../UserAssets'
import { Profile } from '../Profile'
import { ActivityTab } from '../ActivityTab'
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
                    { path: 'activity', element: <ActivityTab /> },
                ],
            },
            { path: 'asset/:root?', element: <AssetFull /> },

            { path: 'profile', element: <Profile /> },
            { path: 'profile/settings', element: <Settings /> },
        ],
    },
])

export function MainPage() {
    return (
        <RouterProvider router={router} />
    )
}
