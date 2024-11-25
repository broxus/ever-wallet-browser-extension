import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

import styles from './IconButton.module.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: ReactNode;
    design?: 'primary' | 'secondary' | 'ghost' | 'transparent';
    size?: 'xs' | 's' | 'm' | 'l';
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
            className={classNames(
                styles.iconButton,
                styles[`_size-${size}`],
                styles[`_design-${design}`],
                className,
            )}
        >
            {icon}
        </button>
    )
})
