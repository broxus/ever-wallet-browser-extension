import { useCallback, useMemo, useState } from 'react'

export type PageHook = {
    closed: boolean
    close(fn: () => void): () => void
}

export const usePage = (): PageHook => {
    const [closed, setClosed] = useState(false)

    const close = useCallback((fn: () => void) => () => {
        setClosed(true)
        setTimeout(fn, 200)
    }, [])

    return useMemo(() => ({
        closed,
        close,
    }), [closed, close])
}
