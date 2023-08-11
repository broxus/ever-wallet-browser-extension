import { createMemoryRouter, Navigate, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'

import { ManageSeeds } from '../ManageSeeds'
import { ManageSeed } from '../ManageSeed'
import { ManageDerivedKey } from '../ManageDerivedKey'
import { ManageAccount } from '../ManageAccount'
import { CreateDerivedKey } from '../CreateDerivedKey'
import { CreateAccount } from '../CreateAccount'
import { CreateSeed } from '../CreateSeed'

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
            { index: true, element: <Navigate to="seeds" replace /> },
            {
                path: 'seeds',
                children: [
                    { index: true, element: <ManageSeeds /> },
                    { path: 'add-seed', element: <CreateSeed /> },
                ],
            },
            {
                path: 'seed',
                children: [
                    { index: true, element: <ManageSeed /> },
                    { path: 'add-key', element: <CreateDerivedKey /> },
                ],
            },
            {
                path: 'key',
                children: [
                    { index: true, element: <ManageDerivedKey /> },
                    { path: 'add-account', element: <CreateAccount /> },
                ],
            },
            { path: 'account', element: <ManageAccount /> },
        ],
    },
])

export function AccountsManagerPage(): JSX.Element {
    return (
        <RouterProvider router={router} />
    )
}
