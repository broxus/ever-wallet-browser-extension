import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { PageLoader, RouterProvider, useResolve } from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { SendPageStore } from '../../store'
import { PrepareMessage } from '../PrepareMessage'
import { ConfirmationPage } from '../ConfirmationPage'
import { SendResult } from '../SendResult'

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
            { index: true, element: <PrepareMessage /> },
            { path: 'confirm', element: <ConfirmationPage /> },
            { path: 'result', element: <SendResult /> },
        ],
    },
])

export const SendPage = observer((): JSX.Element => {
    const store = useResolve(SendPageStore)

    if (!store.initialized) {
        return <PageLoader />
    }

    if (store.ledgerConnect) {
        return (
            <LedgerConnector
                onNext={store.handleLedgerConnected}
                onBack={store.handleLedgerConnected}
            />
        )
    }

    return (
        <PageLoader active={store.ledger.loading}>
            <RouterProvider router={router} />
        </PageLoader>
    )
})
