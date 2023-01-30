import { useEffect, useMemo } from 'react'
import { DependencyContainer } from 'tsyringe'

import { useDI } from '../providers/DIProvider'

interface Setup {
    (container: DependencyContainer): void
}

export function useChildContainer(setup?: Setup): DependencyContainer {
    const parent = useDI()
    const child = useMemo(() => {
        const container = parent.createChildContainer()
        setup?.(container)
        return container
    }, [parent])

    useEffect(() => () => {
        child.dispose()
    }, [])

    return child
}
