import { useContext, useEffect, useMemo } from 'react'

import { PanelView, SlidingPanelContext } from '../providers/SlidingPanelProvider'

export function useSlidingPanel(): PanelView {
    const controller = useContext(SlidingPanelContext)
    const view = useMemo(() => controller.add(), [])

    useEffect(() => () => controller.remove(view.id), [])

    return view
}
