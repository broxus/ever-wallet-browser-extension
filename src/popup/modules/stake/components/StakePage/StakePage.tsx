import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { PageLoader, RouterProvider, useResolve } from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { StakeTransferStore } from '../../store'
import { StakeTutorial } from '../StakeTutorial'
import { StakePrepareMessage } from '../StakePrepareMessage'
import { ConfirmationPage } from '../ConfirmationPage'
import { StakeResult } from '../StakeResult'

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
            { index: true, element: <StakePrepareMessage /> },
            { path: 'tutorial', element: <StakeTutorial /> },
            { path: 'confirm', element: <ConfirmationPage /> },
            { path: 'result', element: <StakeResult /> },
        ],
    },
])

export const StakePage = observer((): JSX.Element => {
    const store = useResolve(StakeTransferStore)

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
