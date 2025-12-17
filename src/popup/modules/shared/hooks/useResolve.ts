import { useMemo } from 'react'
import { type InjectionToken } from 'tsyringe'

import { useDI } from '../providers/DIProvider'

export function useResolve<T>(token: InjectionToken<T>): T {
    const container = useDI()

    return useMemo(() => container.resolve<T>(token), [container])
}
