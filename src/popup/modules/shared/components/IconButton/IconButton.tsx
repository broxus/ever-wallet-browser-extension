import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

import './IconButton.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: ReactNode;
    design?: 'primary' | 'secondary';
    size?: 's' | 'm' | 'l';
};

export const IconButton = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
    const {
        icon,
        className,
        size = 'l',
        design = 'primary',
        type = 'button',
        ...rest
    } = props

    return (
        <button
            {...rest}
            ref={ref}
            type={type}
            className={classNames('icon-button', `_size-${size}`, `_design-${design}`, className)}
        >
            {icon}
        </button>
    )
})
