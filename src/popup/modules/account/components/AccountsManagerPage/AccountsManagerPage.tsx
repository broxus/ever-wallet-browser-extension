import type * as nt from '@broxus/ever-wallet-wasm'
import { createMemoryRouter, Navigate, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'
import { useEffect } from 'react'

import { AccountabilityStore, RouterProvider, RpcStore, useResolve } from '@app/popup/modules/shared'

import { AddAccountFlow } from '../../models'
import { ManageSeeds } from '../ManageSeeds'
import { ManageSeed } from '../ManageSeed'
import { ManageDerivedKey } from '../ManageDerivedKey'
import { ManageAccount } from '../ManageAccount'
import { CreateDerivedKey } from '../CreateDerivedKey'
import { AddAccount } from '../AddAccount'
import { CreateSeed } from '../CreateSeed'

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
            { index: true, element: <Navigate to="seeds" replace /> },
            {
                path: 'seeds',
                children: [
                    { index: true, element: <ManageSeeds /> },
                    { path: 'add-seed', element: <CreateSeed /> },
                ],
            },
            {
                path: 'seed',
                children: [
                    { index: true, element: <ManageSeed /> },
                    { path: 'add-key', element: <CreateDerivedKey /> },
                ],
            },
            {
                path: 'key',
                children: [
                    { index: true, element: <ManageDerivedKey /> },
                    { path: 'add-account/:flow', element: <AddAccount /> },
                ],
            },
            { path: 'account', element: <ManageAccount /> },
        ],
    },
])

export function AccountsManagerPage(): JSX.Element {
    const { rpc } = useResolve(RpcStore)
    const accountability = useResolve(AccountabilityStore)

    useEffect(() => {
        rpc.tempStorageRemove('manage_seeds').then((value: any) => {
            if (!isData(value)) return

            if (value.step === 'create_seed') {
                router.navigate('/seeds/add-seed')
            }

            if (value.step === 'create_account') {
                accountability.setCurrentMasterKey(
                    accountability.masterKeys.find(
                        key => key.masterKey === accountability.selectedMasterKey,
                    ),
                )

                router.navigate(`/key/add-account/${value.flow ?? AddAccountFlow.CREATE}`)
            }

            if (value.step === 'manage_key') {
                accountability.setCurrentMasterKey(
                    accountability.masterKeys.find(
                        key => key.masterKey === value.key.masterKey,
                    ),
                )
                accountability.onManageDerivedKey(value.key)
                router.navigate('/key')
            }
        })
    }, [])

    return (
        <RouterProvider router={router} />
    )
}

type Data =
    | { step: 'create_seed' }
    | { step: 'create_account', flow?: AddAccountFlow }
    | { step: 'manage_key', key: nt.KeyStoreEntry }

function isData(value: any): value is Data {
    return !!value && typeof value === 'object' && 'step' in value
}
