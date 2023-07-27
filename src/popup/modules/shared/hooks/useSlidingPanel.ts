import { useEffect, useMemo, useRef } from 'react'

import { SlidingPanelHandle, SlidingPanelParams, SlidingPanelStore } from '../store'
import { useResolve } from './useResolve'

// TODO: this is for backward compatibility, remove later
export function useSlidingPanel(): PanelView {
    const store = useResolve(SlidingPanelStore)
    const ref = useRef<SlidingPanelHandle>()
    const view: PanelView = useMemo(() => ({
        open: (params: SlidingPanelParams) => {
            ref.current = store.open(params)
        },
        close: () => {
            ref.current?.close()
            ref.current = undefined
        },
    }), [])

    useEffect(() => () => view.close(), [])

    return view
}

interface PanelView {
    open(params: SlidingPanelParams): void;
    close(): void;
}
