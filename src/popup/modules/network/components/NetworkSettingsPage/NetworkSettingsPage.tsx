import { memo, useEffect } from 'react'
import { createMemoryRouter, Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router-dom'

import { RouterProvider } from '@app/popup/modules/shared'

import { NetworkSettings } from '../NetworkSettings'
import { NetworkForm } from '../NetworkForm'

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
            { index: true, element: <NetworkSettings /> },
            { path: '/add', element: <NetworkForm /> },
            { path: '/edit/:id', element: <NetworkForm /> },
        ],
    },
])

export const NetworkSettingsPage = memo((): JSX.Element => {
    // TODO: hook?
    useEffect(() => {
        document.body.classList.add('bg-white')
        return () => document.body.classList.remove('bg-white')
    }, [])

    return <RouterProvider router={router} />
})
