import classNames from 'classnames'
import { Children, HTMLAttributes, memo } from 'react'

import './Hint.scss'

type Props = HTMLAttributes<HTMLElement>;

export const Hint = memo(({ className, children, ...props }: Props): JSX.Element | null => {
    const hasContent = Children.map(children, child => !!child)
        ?.some(child => child) ?? false

    if (!hasContent) return null

    return (
        <div
            className={classNames('hint', className)}
            title={children?.toString()}
            {...props}
        >
            {children}
        </div>
    )
})
