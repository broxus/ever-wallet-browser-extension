import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'
import { SeedSelect } from '@app/popup/modules/account/components/CreateAccountPage/SeedSelect'
import { AccountForm } from '@app/popup/modules/account/components/CreateAccountPage/AccountForm'
import { CreateSuccess } from '@app/popup/modules/account/components/CreateAccountPage/CreateSuccess'

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
            // { index: true, element: <AccountCreateType /> },
            { index: true, element: <CreateSuccess /> },
            { path: '/create', element: <SeedSelect /> },
            { path: '/create/account', element: <AccountForm /> },
            { path: '/create/success', element: <CreateSuccess /> },
        ],
    },
])

export const CreateAccountPage = observer((): JSX.Element => (
    <RouterProvider router={router} />
))
