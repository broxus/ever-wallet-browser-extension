import { useEffect, useMemo, useRef } from 'react'

import { type SlidingPanelHandle, type SlidingPanelParams, SlidingPanelStore } from '../store'
import { useResolve } from './useResolve'

export function useSlidingPanel(): PanelView {
    const store = useResolve(SlidingPanelStore)
    const ref = useRef<SlidingPanelHandle>(undefined)
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
