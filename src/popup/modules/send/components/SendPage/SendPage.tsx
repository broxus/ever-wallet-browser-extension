import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { PageLoader, RouterProvider, useResolve } from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { AssetTransferStore } from '../../store'
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
    const transfer = useResolve(AssetTransferStore)

    if (!transfer.initialized) {
        return <PageLoader />
    }

    if (transfer.ledgerConnect) {
        return (
            <LedgerConnector
                onNext={transfer.handleLedgerConnected}
                onBack={transfer.handleLedgerConnected}
            />
        )
    }

    return (
        <PageLoader active={transfer.ledger.loading}>
            <RouterProvider router={router} />
        </PageLoader>
    )
})
