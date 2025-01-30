import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'
import { SeedSelect } from '@app/popup/modules/account/components/CreateAccountPage/SeedSelect/SeedSelect'
import { AccountForm } from '@app/popup/modules/account/components/CreateAccountPage/AccountForm/AccountForm'
import { CreateSuccess } from '@app/popup/modules/account/components/CreateAccountPage/CreateSuccess/CreateSuccess'
import { AccountCreateType } from '@app/popup/modules/account/components/CreateAccountPage/AccountCreateType/AccountCreateType'
import { AddExternalAccount } from '@app/popup/modules/account/components/CreateAccountPage/AddExternalAccount/AddExternalAccount'

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
            { index: true, element: <AccountCreateType /> },
            { path: '/create/:seed?', element: <SeedSelect /> },
            { path: '/create/:seed/account', element: <AccountForm /> },
            { path: '/external', element: <AddExternalAccount /> },
            { path: '/success/:address', element: <CreateSuccess /> },
        ],
    },
])

export const CreateAccountPage = observer((): JSX.Element => (
    <RouterProvider router={router} />
))
