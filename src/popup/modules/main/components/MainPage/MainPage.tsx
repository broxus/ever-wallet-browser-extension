import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { DrawerPanelProvider, RouterProvider } from '@app/popup/modules/shared'

import { Dashboard } from '../Dashboard'
import { ManageAssets } from '../ManageAssets'
import { AssetFull } from '../AssetFull'

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
