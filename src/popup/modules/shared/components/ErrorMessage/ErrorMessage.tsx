import classNames from 'classnames'
import { Children, HTMLAttributes, memo } from 'react'

import './ErrorMessage.scss'

type Props = HTMLAttributes<HTMLElement> & {
    type?: 'warning' | 'error'
};

export const ErrorMessage = memo(({ className, children, type, ...props }: Props): JSX.Element | null => {
    const hasContent = Children.map(children, child => !!child)
        ?.some(child => child) ?? false

    if (!hasContent) return null

    return (
        <div
            className={classNames('error-message', type, className)}
            title={children?.toString()}
            {...props}
        >
            {children}
        </div>
    )
})
