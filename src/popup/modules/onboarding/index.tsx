import { createMemoryRouter } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import { RouterProvider } from '@app/popup/modules/shared'
import { SelectNetwork } from '@app/popup/modules/onboarding/pages/SelectNetwork/SelectNetwork'

import { Layout } from './components/layouts/Layout'
import { Welcome } from './pages/Welcome'
import { SaveSeed } from './pages/SaveSeed'
import { CheckSeed } from './pages/CheckSeed'
import { CreatePassword } from './pages/CreatePassword'
import { Confirmation } from './pages/Confirmation'
import { EnterSeed } from './pages/EnterSeed'
import { SelectKeys } from './pages/SelectKeys'
import { NewAccount } from './modules/NewAccount'
import { ImportAccount } from './modules/ImportAccount'
import { LedgerSignIn } from './modules/LedgerSignIn'
import { LedgerConnector } from './pages/LedgerConnector'
import { appRoutes } from './appRoutes'

const router = createMemoryRouter([
    {
        path: appRoutes.welcome.path,
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Welcome />,
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
                    {
                        path: appRoutes.selectNetwork.path,
                        element: <SelectNetwork nextPath={`${appRoutes.newAccount.path}/${appRoutes.saveSeed.path}`} />,
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
                    {
                        path: appRoutes.selectNetwork.path,
                        element: <SelectNetwork nextPath={`${appRoutes.importAccount.path}/${appRoutes.enterSeed.path}`} />,
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
                    {
                        path: appRoutes.selectNetwork.path,
                        element: <SelectNetwork nextPath={`${appRoutes.ledgerSignIn.path}/${appRoutes.connectLedger.path}`} />,
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

function OnboardingPageInner(): JSX.Element {
    return <RouterProvider router={router} />
}

const OnboardingPage = observer(OnboardingPageInner)

export default OnboardingPage
