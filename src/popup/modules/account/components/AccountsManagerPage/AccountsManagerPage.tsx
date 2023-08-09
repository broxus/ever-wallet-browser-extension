import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'

import { ManageSeeds } from '../ManageSeeds'
import { ManageSeed } from '../ManageSeed'

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
            { index: true, element: <ManageSeeds /> },
            { path: 'seed', element: <ManageSeed /> },
        ],
    },
])

export function AccountsManagerPage(): JSX.Element {
    return (
        <RouterProvider router={router} />
    )
}
