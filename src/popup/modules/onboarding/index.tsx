import { useCallback } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import { Layout } from './components/layouts/Layout'
import { Welcome } from './pages/Welcome'
import { SaveSeed } from './pages/SaveSeed'
import { CheckSeed } from './pages/CheckSeed'
import { CreatePassword } from './pages/CreatePassword'
import { Confirmation } from './pages/Confirmation'
import { EnterSeed } from './pages/EnterSeed'
import { SelectKeys } from './pages/SelectKeys'
import { OnboardingStore } from './store/OnboardingStore'
import { NewAccount } from './modules/NewAccount'
import { ImportAccount } from './modules/ImportAccount'
import { LedgerSignIn } from './modules/LedgerSignIn'
import { useResolve } from '../shared'
import { LedgerConnector } from './pages/LedgerConnector'
import { appRoutes } from './appRoutes'


function OnboardingPageInner(): JSX.Element {
    const { restoreFromBackup } = useResolve(OnboardingStore)

    const handleRestore = useCallback((nav: any) => {
        restoreFromBackup().then((e) => {
            if (e?.message !== 'Failed to import storage') {
                nav(`${appRoutes.newAccount.path}/${appRoutes.confirmation.path}`)
            }
        })

    }, [])

    const router = createMemoryRouter([
        {
            path: appRoutes.welcome.path,
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <Welcome
                        onRestore={(e) => handleRestore(e)}
                    />,
                },
                {
                    path: appRoutes.newAccount.path,
                    element: <NewAccount />,
                    children: [
                        {
                            path: appRoutes.saveSeed.path,
                            element: <SaveSeed />,
                        },
                        {
                            path: appRoutes.checkSeed.path,
                            element: <CheckSeed />,
                        },
                        {
                            path: appRoutes.createPassword.path,
                            element: <CreatePassword step="new" />,
                        },
                        {
                            path: appRoutes.confirmation.path,
                            element: <Confirmation />,
                        },
                    ],
                },
                {
                    path: appRoutes.importAccount.path,
                    element: <ImportAccount />,
                    children: [
                        {
                            path: appRoutes.enterSeed.path,
                            element: <EnterSeed />,
                        },
                        {
                            path: appRoutes.createPassword.path,
                            element: <CreatePassword step="import" />,
                        },
                        {
                            path: appRoutes.confirmation.path,
                            element: <Confirmation />,
                        },
                    ],
                },
                {
                    path: appRoutes.ledgerSignIn.path,
                    element: <LedgerSignIn />,
                    children: [
                        {
                            path: appRoutes.connectLedger.path,
                            element: <LedgerConnector />,
                        },
                        {
                            path: appRoutes.selectKeys.path,
                            element: <SelectKeys />,
                        },
                        {
                            path: appRoutes.confirmation.path,
                            element: <Confirmation />,
                        },
                    ],
                },
                {
                    path: '*',
                    element: <>404</>,
                },
            ],
        },
    ])

    return (
        <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
    )
}

const OnboardingPage = observer(OnboardingPageInner)

export default OnboardingPage
