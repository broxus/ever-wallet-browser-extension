import classNames from 'classnames'
import { HTMLAttributes, memo, useLayoutEffect } from 'react'

import './Footer.scss'

type Props = HTMLAttributes<HTMLElement>;

let count = 0

export const Footer = memo(({ className, ...props }: Props): JSX.Element => {
    useLayoutEffect(() => {
        count++
        document.body.classList.add('_has-footer')

        return () => {
            if (--count === 0) {
                document.body.classList.remove('_has-footer')
            }
        }
    }, [])

    return (
        <footer className={classNames('layout-footer', className)} {...props} />
    )
})
