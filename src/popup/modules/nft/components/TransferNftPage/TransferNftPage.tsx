import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { PageLoader, RouterProvider, useResolve } from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { NftTransferStore } from '../../store'
import { PrepareMessage } from '../PrepareMessage'
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
            { index: true, element: <PrepareMessage /> },
            { path: 'confirm', element: <ConfirmationPage /> },
        ],
    },
])

export const TransferNftPage = observer((): JSX.Element => {
    const store = useResolve(NftTransferStore)

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
