import classNames from 'classnames'
import { HTMLAttributes, memo, useEffect, useRef, useState } from 'react'

import './Header.scss'

type Props = HTMLAttributes<HTMLElement>;

export const Header = memo(({ className, ...props }: Props): JSX.Element => {
    const [scroll, setScroll] = useState(false)
    const ref = useRef<HTMLElement>(null)

    useEffect(() => {
        const container = getScrollContainer(ref.current!)
        const target = container === document.documentElement ? document : container
        const listener = () => setScroll(container.scrollTop !== 0)

        target.addEventListener('scroll', listener, { passive: true })
        listener()

        return () => target.removeEventListener('scroll', listener)
    }, [])

    return (
        <header {...props} ref={ref} className={classNames('layout-header', className, { _scroll: scroll })} />
    )
})

const getScrollContainer = (element: HTMLElement) => {
    let parent = element.parentElement
    while (parent) {
        const { overflow } = window.getComputedStyle(parent)
        if (overflow.split(' ').every(o => o === 'auto' || o === 'scroll')) {
            return parent
        }
        parent = parent.parentElement
    }

    return document.documentElement
}
