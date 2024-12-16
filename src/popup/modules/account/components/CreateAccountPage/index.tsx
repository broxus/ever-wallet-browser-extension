import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'
import { SeedSelect } from '@app/popup/modules/account/components/CreateAccountPage/SeedSelect'
import { AccountForm } from '@app/popup/modules/account/components/CreateAccountPage/AccountForm'
import { CreateSuccess } from '@app/popup/modules/account/components/CreateAccountPage/CreateSuccess'
import { AccountCreateType } from '@app/popup/modules/account/components/CreateAccountPage/AccountCreateType'

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
            { path: '/create/:seedIndex?', element: <SeedSelect /> },
            { path: '/create/:seedIndex/account', element: <AccountForm /> },
            { path: '/success', element: <CreateSuccess /> },
        ],
    },
])

export const CreateAccountPage = observer((): JSX.Element => (
    <RouterProvider router={router} />
))
