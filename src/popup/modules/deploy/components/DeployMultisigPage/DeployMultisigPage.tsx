import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { PageLoader, RouterProvider, useResolve } from '@app/popup/modules/shared'

import { DeployStore } from '../../store'
import { DeployMultisigWallet } from '../DeployMultisigWallet'
import { ConfirmationPage } from '../ConfirmationPage'

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
            { index: true, element: <DeployMultisigWallet /> },
            { path: 'confirm', element: <ConfirmationPage /> },
        ],
    },
])

export const DeployMultisigPage = observer((): JSX.Element => {
    const store = useResolve(DeployStore)

    if (!store.account || !store.selectedDerivedKeyEntry) {
        return <PageLoader />
    }

    return (
        <RouterProvider router={router} />
    )
})
