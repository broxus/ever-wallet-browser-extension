import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

import './IconButton.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: ReactNode;
    size?: 's' | 'm' | 'l';
};

export const IconButton = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
    const {
        icon,
        className,
        size = 'm',
        type = 'button',
        ...rest
    } = props

    return (
        <button
            {...rest}
            ref={ref}
            type={type}
            className={classNames('icon-button', `_size-${size}`, className)}
        >
            {icon}
        </button>
    )
})
