import classNames from 'classnames'
import { HTMLAttributes, memo, useEffect, useState } from 'react'

import './Header.scss'

type Props = HTMLAttributes<HTMLElement>;

export const Header = memo(({ className, ...props }: Props): JSX.Element => {
    const [scroll, setScroll] = useState(false)

    useEffect(() => {
        const listener = () => {
            if (document.scrollingElement) {
                setScroll(document.scrollingElement.scrollTop !== 0)
            }
        }

        document.addEventListener('scroll', listener, { passive: true })
        listener()

        return () => document.removeEventListener('scroll', listener)
    }, [])

    return (
        <header {...props} className={classNames('layout-header', className, { _scroll: scroll })} />
    )
})
