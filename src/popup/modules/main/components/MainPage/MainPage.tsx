import { createMemoryRouter, Navigate, Outlet } from 'react-router'

import { RouterProvider } from '@app/popup/modules/shared'
import { NftCollections } from '@app/popup/modules/nft'
import { TransactionInfo } from '@app/popup/modules/main/components/TransactionInfo'

import { Dashboard } from '../Dashboard'
import { AssetFull } from '../AssetFull'
import { AssetList } from '../UserAssets'
import { Profile } from '../Profile'
import { Settings } from '../Settings'

const router = createMemoryRouter([
    {
        path: '/',
        element: (
            <Outlet />
        ),
        children: [
            { index: true, element: <Navigate to="/dashboard/assets" replace /> },

            {
                path: 'dashboard',
                element: <Dashboard />,
                children: [
                    { path: 'nft', element: <NftCollections /> },
                    {
                        path: 'assets',
                        element: <AssetList />,
                        children: [
                            {
                                path: ':root',
                                element: <AssetFull />,
                                children: [
                                    {
                                        path: ':hash',
                                        element: <TransactionInfo />,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
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
