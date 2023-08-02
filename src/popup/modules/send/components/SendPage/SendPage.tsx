import { observer } from 'mobx-react-lite'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { closeCurrentWindow } from '@app/shared'
import { DIProvider, Loader, PageLoader, RouterProvider, useChildContainer, useResolve, useViewModel } from '@app/popup/modules/shared'

import { SendPageStore } from '../../store'
import { PrepareMessage } from '../PrepareMessage'
import { SendResult } from '../SendResult'
import { LedgerConnector } from '@app/popup/modules/ledger'

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
            { path: 'confirm', element: null },
            // { path: 'result', element: <SendResult /> },
        ],
    },
])

export const SendPage = observer((): JSX.Element => {
    const store = useResolve(SendPageStore)

    if (!store.initialized) {
        return <PageLoader />
    }

    // TODO
    // {vm.ledger.loading && <PageLoader />}

    // TODO
    // if (vm.step.is(Step.LedgerConnect)) {
    //     return (
    //         <LedgerConnector
    //             onNext={vm.openEnterAddress}
    //             onBack={vm.openEnterAddress}
    //         />
    //     )
    // }

    // if (vm.messageParams) {
    //     return (
    //         <SendResult
    //             recipient={vm.messageParams.recipient}
    //             onClose={closeCurrentWindow}
    //         />
    //     )
    // }
    //
    // return (
    //     <PrepareMessage
    //         defaultAsset={vm.initialSelectedAsset}
    //         defaultAddress={vm.initialSelectedAddress}
    //         onBack={closeCurrentWindow}
    //         onSend={vm.handleSend}
    //     />
    // )

    return (
        <RouterProvider router={router} />
    )
})
