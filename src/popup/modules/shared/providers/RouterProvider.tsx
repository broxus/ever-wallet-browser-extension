import { RouterProvider as ReactRouterProvider } from 'react-router'
import { useRef } from 'react'

import { Router } from '../models'
import { useDI } from './DIProvider'
import { RouterToken } from '../di-container'

interface Props {
    router: Router;
}

export function RouterProvider({ router }: Props) {
    const container = useDI()
    const ref = useRef(false)

    if (!ref.current) {
        ref.current = true
        container.registerInstance(RouterToken, router)
    }

    return (
        <ReactRouterProvider router={router} />
    )
}
