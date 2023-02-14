import { runInAction } from 'mobx'
import { DependencyList, useEffect, useMemo, useRef } from 'react'
import { InjectionToken } from 'tsyringe'

import { useChildContainer } from './useChildContainer'

export function useViewModel<T>(token: InjectionToken<T>, apply?: (vm: T) => void, deps?: DependencyList): T {
    const container = useChildContainer()
    const vm = useMemo(() => {
        const instance = container.resolve(token)
        apply?.(instance)
        return instance
    }, [])

    if (apply && deps) {
        const initializedRef = useRef(false)

        useEffect(() => {
            if (initializedRef.current) {
                runInAction(() => apply(vm))
            }
            initializedRef.current = true
        }, deps)
    }

    return vm
}
