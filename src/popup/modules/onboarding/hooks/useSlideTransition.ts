import { RefObject, useMemo, useRef } from 'react'

export function useSlideTransition(ref: RefObject<HTMLElement>) {
    const className = useRef<string[]>([])

    return useMemo(() => ({
        setClassName(value: string | string[]) {
            className.current = Array.isArray(value) ? value : [value]
        },
        transitionProps: {
            mountOnEnter: true,
            unmountOnExit: true,
            timeout: 300,
            classNames: 'slide-transition',
            onExit() {
                if (className.current.length) {
                    ref.current?.classList.add(...className.current)
                }
            },
            onEnter() {
                if (className.current.length) {
                    ref.current?.classList.add(...className.current)
                }
            },
            onEntered() {
                if (className.current.length) {
                    ref.current?.classList.remove(...className.current)
                }
            },
            onExited() {
                if (className.current.length) {
                    ref.current?.classList.remove(...className.current)
                }
            },
        },
    }), [])
}
